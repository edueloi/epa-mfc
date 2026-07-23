import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import bcrypt from 'bcryptjs';

let pool: Pool | null = null;

export async function getDb(): Promise<Pool> {
  if (pool) return pool;

  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'epa_mfc',
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true,
  });

  await initTables(pool);
  console.log('✓ Conectado ao banco MySQL:', process.env.DB_NAME || 'epa_mfc');

  return pool;
}

export function saveDb() {
  // No-op: MySQL persiste cada escrita imediatamente (sem necessidade de flush manual).
}

async function initTables(database: Pool) {
  await database.query(`
    CREATE TABLE IF NOT EXISTS cities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const [cityRows] = await database.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM cities');
  if ((cityRows[0]?.count || 0) === 0) {
    const defaultCities = ['Tatuí', 'Pirassununga', 'Descalvado', 'Rio Claro', 'Araraquara'];
    for (const name of defaultCities) {
      await database.query(`INSERT INTO cities (name) VALUES (?)`, [name]);
    }
    console.log('✓ Cidades padrão cadastradas.');
  }

  await database.query(`
    CREATE TABLE IF NOT EXISTS workshops (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      instructor VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      time_slot VARCHAR(50) DEFAULT '1ª Oficina',
      max_slots INT DEFAULT 30
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await database.query(`
    CREATE TABLE IF NOT EXISTS participants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      city_id INT,
      family_group VARCHAR(255) NOT NULL,
      workshop1_id INT,
      workshop2_id INT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await database.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      participant_id INT NOT NULL,
      workshop_id INT NOT NULL,
      status ENUM('PRESENTE', 'FALTA') NOT NULL,
      marked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_participant_workshop (participant_id, workshop_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await database.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // An oficineiro account may be linked to more than one workshop occurrence
  // (e.g. the same theme repeating at 08:30 and again at 10:30 with the same instructor).
  await database.query(`
    CREATE TABLE IF NOT EXISTS oficineiro_workshops (
      user_id INT NOT NULL,
      workshop_id INT NOT NULL,
      PRIMARY KEY (user_id, workshop_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const [userRows] = await database.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM users');
  if ((userRows[0]?.count || 0) === 0) {
    const defaultHash = await bcrypt.hash('Admin@123', 10);
    await database.query(
      `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`,
      ['Admin', defaultHash, 'admin']
    );
    console.log('✓ Usuário padrão "Admin" criado.');
  }

  // Migration: older deployments had a single users.workshop_id column.
  // Move any existing links into oficineiro_workshops, then drop the column.
  const [legacyColRows] = await database.query<RowDataPacket[]>(`
    SELECT COUNT(*) as count FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'workshop_id'
  `);
  if ((legacyColRows[0]?.count || 0) > 0) {
    await database.query(`
      INSERT IGNORE INTO oficineiro_workshops (user_id, workshop_id)
      SELECT id, workshop_id FROM users WHERE workshop_id IS NOT NULL
    `);

    const [fkRows] = await database.query<RowDataPacket[]>(`
      SELECT CONSTRAINT_NAME AS constraintName FROM information_schema.key_column_usage
      WHERE table_schema = DATABASE() AND table_name = 'users'
        AND column_name = 'workshop_id' AND referenced_table_name IS NOT NULL
    `);
    for (const fk of fkRows) {
      await database.query(`ALTER TABLE users DROP FOREIGN KEY \`${fk.constraintName}\``);
    }

    await database.query(`ALTER TABLE users DROP COLUMN workshop_id`);
    console.log('✓ Migração: users.workshop_id movido para oficineiro_workshops.');
  }

  await database.query(`
    CREATE TABLE IF NOT EXISTS surveys (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pre_study_rating INT NOT NULL DEFAULT 5,
      pre_study_comment TEXT,
      marketing_rating INT NOT NULL DEFAULT 5,
      marketing_comment TEXT,
      welcome_rating INT NOT NULL DEFAULT 5,
      checkin_rating INT NOT NULL DEFAULT 5,
      infra_accommodation INT NOT NULL DEFAULT 5,
      infra_breakfast INT NOT NULL DEFAULT 5,
      infra_lunch INT NOT NULL DEFAULT 5,
      infra_dinner INT NOT NULL DEFAULT 5,
      infra_restrooms INT NOT NULL DEFAULT 5,
      infra_tech INT NOT NULL DEFAULT 5,
      infra_lodging_used INT NOT NULL DEFAULT 1,
      infra_lodging_rating INT DEFAULT 5,
      participated_workshops INT NOT NULL DEFAULT 1,
      workshop1_id INT,
      workshop1_rating INT DEFAULT NULL,
      workshop2_id INT,
      workshop2_rating INT DEFAULT NULL,
      youth_moment_rating INT DEFAULT 5,
      mirim_moment_rating INT DEFAULT 5,
      animation_rating INT DEFAULT 5,
      mass_rating INT DEFAULT 5,
      liturgy_rating INT DEFAULT 5,
      eco_friendly_rating INT DEFAULT 5,
      recommendation_text TEXT,
      recommendation_nps INT DEFAULT 10,
      epa_word VARCHAR(255),
      general_suggestions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Migration: older deployments may be missing the newer survey columns.
  const surveyColumnsToAdd = [
    { name: 'participated_workshops', ddl: 'ADD COLUMN participated_workshops INT NOT NULL DEFAULT 1' },
    { name: 'epa_word', ddl: 'ADD COLUMN epa_word VARCHAR(255)' },
  ];
  for (const col of surveyColumnsToAdd) {
    const [existsRows] = await database.query<RowDataPacket[]>(`
      SELECT COUNT(*) as count FROM information_schema.columns
      WHERE table_schema = DATABASE() AND table_name = 'surveys' AND column_name = ?
    `, [col.name]);
    if ((existsRows[0]?.count || 0) === 0) {
      await database.query(`ALTER TABLE surveys ${col.ddl}`);
      console.log(`✓ Migração: coluna surveys.${col.name} adicionada.`);
    }
  }
}

export async function seedInitialData(database: Pool) {
  // Reset (used by /api/seed): clears all event data, keeping cities and user accounts intact.
  await database.query('DELETE FROM attendance');
  await database.query('DELETE FROM participants');
  await database.query('DELETE FROM workshops');
  await database.query('DELETE FROM surveys');
  console.log('✓ Dados do evento (oficinas, participantes, presenças, pesquisas) foram zerados.');
}

export async function queryAll(database: Pool, sql: string, params: any[] = []): Promise<any[]> {
  const [rows] = await database.query<RowDataPacket[]>(sql, params);
  return rows;
}

export async function queryOne(database: Pool, sql: string, params: any[] = []): Promise<any | null> {
  const rows = await queryAll(database, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function run(database: Pool, sql: string, params: any[] = []): Promise<ResultSetHeader> {
  const [result] = await database.query<ResultSetHeader>(sql, params);
  return result;
}
