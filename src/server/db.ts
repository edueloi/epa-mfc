import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

let db: Database | null = null;
const dbDir = path.join(process.cwd(), 'data');
const dbFilePath = path.join(dbDir, 'epa_database.sqlite');

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (fs.existsSync(dbFilePath)) {
    try {
      const filebuffer = fs.readFileSync(dbFilePath);
      db = new SQL.Database(filebuffer);
      console.log('✓ Conectado ao banco SQLite existente em:', dbFilePath);
    } catch (err) {
      console.error('Erro ao ler banco de dados SQLite, criando novo:', err);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
    console.log('✓ Novo banco de dados SQLite criado.');
  }

  initTables(db);
  saveDb();
  return db;
}

export function saveDb() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFilePath, buffer);
  } catch (err) {
    console.error('Erro ao salvar banco de dados SQLite em disco:', err);
  }
}

function initTables(database: Database) {
  // Table: workshops
  database.run(`
    CREATE TABLE IF NOT EXISTS workshops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      instructor TEXT NOT NULL,
      location TEXT NOT NULL,
      time_slot TEXT DEFAULT '1ª Oficina',
      max_slots INTEGER DEFAULT 30
    );
  `);

  // Table: participants
  database.run(`
    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      family_group TEXT NOT NULL,
      workshop1_id INTEGER,
      workshop2_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Table: attendance
  database.run(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_id INTEGER NOT NULL,
      workshop_id INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('PRESENTE', 'FALTA')),
      marked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(participant_id, workshop_id) ON CONFLICT REPLACE
    );
  `);

  // Table: surveys (Pesquisa de Satisfação do EPA - 100% Anônima)
  database.run(`
    CREATE TABLE IF NOT EXISTS surveys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pre_study_rating INTEGER NOT NULL DEFAULT 5,
      pre_study_comment TEXT,
      marketing_rating INTEGER NOT NULL DEFAULT 5,
      marketing_comment TEXT,
      welcome_rating INTEGER NOT NULL DEFAULT 5,
      checkin_rating INTEGER NOT NULL DEFAULT 5,
      infra_accommodation INTEGER NOT NULL DEFAULT 5,
      infra_breakfast INTEGER NOT NULL DEFAULT 5,
      infra_lunch INTEGER NOT NULL DEFAULT 5,
      infra_dinner INTEGER NOT NULL DEFAULT 5,
      infra_restrooms INTEGER NOT NULL DEFAULT 5,
      infra_tech INTEGER NOT NULL DEFAULT 5,
      infra_lodging_used INTEGER NOT NULL DEFAULT 1,
      infra_lodging_rating INTEGER DEFAULT 5,
      workshop1_id INTEGER,
      workshop1_rating INTEGER DEFAULT 5,
      workshop2_id INTEGER,
      workshop2_rating INTEGER DEFAULT 5,
      youth_moment_rating INTEGER DEFAULT 5,
      mirim_moment_rating INTEGER DEFAULT 5,
      animation_rating INTEGER DEFAULT 5,
      mass_rating INTEGER DEFAULT 5,
      liturgy_rating INTEGER DEFAULT 5,
      eco_friendly_rating INTEGER DEFAULT 5,
      recommendation_text TEXT,
      recommendation_nps INTEGER DEFAULT 10,
      general_suggestions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Check if seed data is needed
  const res = database.exec("SELECT COUNT(*) as count FROM workshops");
  const count = res[0]?.values[0][0] || 0;
  if (count === 0) {
    seedInitialData(database);
  }
}

export function seedInitialData(database: Database) {
  console.log('🌱 Semeando dados iniciais do 5º EPA Pirassununga...');

  // Workshops
  const workshops = [
    ['Família e Espiritualidade na Sociedade Atual', 'Diácono Carlos & Maria', 'Auditório Principal - Bloco A', '1ª Oficina', 40],
    ['Educação dos Filhos e Desafios Tecnológicos', 'Prof. Roberto e Profa. Ana', 'Sala 102 - Bloco B', '1ª Oficina', 35],
    ['Sustentabilidade e Recursos Naturais na Vida Cristã', 'Irmã Tereza & Equipe Eco', 'Espaço Convivência', '1ª Oficina', 30],
    ['Comunicação Acolhedora e Diálogo Conjugal', 'Dr. Marcos & Dra. Patrícia', 'Auditório Principal - Bloco A', '2ª Oficina', 40],
    ['Engajamento Jovem e Liderança no MFC', 'Gabriel & Juliana (Equipe Jovem)', 'Sala 104 - Bloco B', '2ª Oficina', 35],
    ['Liturgia Viva e Oração nas Cidades', 'Padre Fernando & Comissão Litúrgica', 'Capela Central', '2ª Oficina', 30]
  ];

  for (const w of workshops) {
    database.run(
      `INSERT INTO workshops (title, instructor, location, time_slot, max_slots) VALUES (?, ?, ?, ?, ?)`,
      w
    );
  }

  // Participants
  const participants = [
    ['José Silva', 'Pirassununga', 'Família Silva', 1, 4],
    ['Maria Oliveira Silva', 'Pirassununga', 'Família Silva', 1, 4],
    ['Carlos Eduardo Souza', 'Araras', 'Família Souza', 2, 5],
    ['Fernanda Lima Souza', 'Araras', 'Família Souza', 2, 5],
    ['Antonio Marcos Rocha', 'Limeira', 'Família Rocha', 3, 6],
    ['Beatriz Ramos Rocha', 'Limeira', 'Família Rocha', 3, 6],
    ['Paulo Henrique Santos', 'Rio Claro', 'Família Santos', 1, 5],
    ['Luciana Cristina Santos', 'Rio Claro', 'Família Santos', 1, 5],
    ['Roberto Barbosa', 'Campinas', 'Família Barbosa', 2, 4],
    ['Camila Nogueira Barbosa', 'Campinas', 'Família Barbosa', 2, 4],
    ['Geraldo Mendes', 'Pirassununga', 'Família Mendes', 3, 6],
    ['Tânia Mara Mendes', 'Pirassununga', 'Família Mendes', 3, 6]
  ];

  for (const p of participants) {
    database.run(
      `INSERT INTO participants (name, city, family_group, workshop1_id, workshop2_id) VALUES (?, ?, ?, ?, ?)`,
      p
    );
  }

  // Attendance
  const attendance = [
    [1, 1, 'PRESENTE'],
    [1, 4, 'PRESENTE'],
    [2, 1, 'PRESENTE'],
    [2, 4, 'PRESENTE'],
    [3, 2, 'PRESENTE'],
    [3, 5, 'FALTA'],
    [4, 2, 'PRESENTE'],
    [4, 5, 'PRESENTE'],
    [5, 3, 'PRESENTE'],
    [5, 6, 'PRESENTE'],
    [6, 3, 'PRESENTE'],
    [6, 6, 'PRESENTE'],
    [7, 1, 'FALTA'],
    [7, 5, 'PRESENTE'],
    [8, 1, 'PRESENTE'],
    [8, 5, 'PRESENTE']
  ];

  for (const a of attendance) {
    database.run(
      `INSERT INTO attendance (participant_id, workshop_id, status) VALUES (?, ?, ?)`,
      a
    );
  }

  // Sample anonymous surveys
  const surveys = [
    [
      5, 'Ótimos materiais enviados antes do evento.',
      5, 'Divulgação muito clara na nossa paróquia.',
      5, 5, // welcome, checkin
      5, 5, 5, 5, 4, 5, 1, 5, // infra
      1, 5, 4, 5, // workshops
      5, 5, 5, 5, 5, 5, // moments & liturgy & eco
      'O 5º EPA em Pirassununga superou todas as expectativas! Momento abençoado para toda a família.', 10,
      'Continuar com os copos reutilizáveis no próximo evento!'
    ],
    [
      4, 'Material de estudo excelente.',
      4, 'Chegou com antecedência.',
      5, 4,
      4, 5, 4, 5, 5, 4, 1, 4,
      2, 5, 5, 4,
      4, 5, 5, 5, 4, 5,
      'Recomendo muito! Foi uma renovação espiritual incrível para nosso casal.', 9,
      'Placa de sinalização melhor nas salas das oficinas.'
    ],
    [
      5, 'O estudo prévio nos ajudou a chegar no clima do EPA.',
      5, 'Divulgação via WhatsApp foi ótima.',
      5, 5,
      5, 5, 5, 5, 5, 5, 0, 0, // Não hospedou
      3, 4, 6, 5,
      5, 5, 4, 5, 5, 4,
      'Participem sem falta no próximo EPA! Organização impecável em Pirassununga.', 10,
      'Mais momentos de animação com as crianças no sábado à tarde.'
    ],
    [
      4, '',
      3, 'Poderia ter tido mais cartazes na cidade.',
      4, 5,
      4, 4, 5, 4, 4, 4, 1, 4,
      1, 4, 4, 4,
      4, 4, 4, 5, 4, 4,
      'Vale muito a pena participar. Povo muito acolhedor em Pirassununga!', 8,
      'Ar condicionado da sala 102 estava um pouco frio.'
    ]
  ];

  for (const s of surveys) {
    database.run(
      `INSERT INTO surveys (
        pre_study_rating, pre_study_comment,
        marketing_rating, marketing_comment,
        welcome_rating, checkin_rating,
        infra_accommodation, infra_breakfast, infra_lunch, infra_dinner, infra_restrooms, infra_tech, infra_lodging_used, infra_lodging_rating,
        workshop1_id, workshop1_rating, workshop2_id, workshop2_rating,
        youth_moment_rating, mirim_moment_rating, animation_rating, mass_rating, liturgy_rating, eco_friendly_rating,
        recommendation_text, recommendation_nps, general_suggestions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      s
    );
  }

  console.log('✓ Banco de dados SQLite populado com sucesso.');
}

// SQL Query Helpers
export function queryAll(database: Database, sql: string, params: any[] = []): any[] {
  const stmt = database.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export function queryOne(database: Database, sql: string, params: any[] = []): any | null {
  const rows = queryAll(database, sql, params);
  return rows.length > 0 ? rows[0] : null;
}
