import 'dotenv/config';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getDb, queryAll, queryOne, run, seedInitialData } from './src/server/db.js';

interface SessionInfo {
  username: string;
  role: string;
  workshopId: number | null;
  expiresAt: number;
}

declare global {
  namespace Express {
    interface Request {
      session?: SessionInfo;
    }
  }
}

const activeSessions = new Map<string, SessionInfo>();
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Initialize MySQL Database
  const db = await getDb();

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // POST Login
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
      }

      const user = await queryOne(db, 'SELECT * FROM users WHERE username = ?', [username.trim()]);
      if (!user) {
        return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      activeSessions.set(token, {
        username: user.username,
        role: user.role,
        workshopId: user.workshop_id || null,
        expiresAt: Date.now() + SESSION_TTL_MS
      });

      res.json({
        success: true,
        token,
        username: user.username,
        role: user.role,
        workshop_id: user.workshop_id || null
      });
    } catch (err: any) {
      console.error('Erro /api/login:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // POST Logout
  app.post('/api/logout', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) activeSessions.delete(token);
    res.json({ success: true });
  });

  // GET Session check
  app.get('/api/session', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = token ? activeSessions.get(token) : undefined;

    if (!session || session.expiresAt < Date.now()) {
      if (token) activeSessions.delete(token);
      return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }

    res.json({ username: session.username, role: session.role, workshop_id: session.workshopId });
  });

  // Middleware to protect organizer-only routes; attaches session info to req.session
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = token ? activeSessions.get(token) : undefined;

    if (!session || session.expiresAt < Date.now()) {
      if (token) activeSessions.delete(token);
      return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
    }

    req.session = session;
    next();
  };

  // Middleware to restrict a route to admins only (must run after requireAuth)
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.session?.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas a organização (Admin) pode realizar esta ação.' });
    }
    next();
  };

  // Attaches session info to req.session when a valid token is present, but never blocks the request.
  // Used by routes that are public (e.g. the anonymous survey listing workshops) but behave
  // differently for a logged-in oficineiro (who should only see their own workshop).
  const optionalAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = token ? activeSessions.get(token) : undefined;
    if (session && session.expiresAt >= Date.now()) {
      req.session = session;
    }
    next();
  };

  // GET Cities
  app.get('/api/cities', async (req, res) => {
    try {
      const cities = await queryAll(db, 'SELECT * FROM cities ORDER BY name ASC');
      res.json(cities);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST City (Admin only)
  app.post('/api/cities', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
      }

      const existing = await queryOne(db, 'SELECT id FROM cities WHERE name = ?', [name.trim()]);
      if (existing) {
        return res.status(400).json({ error: 'Esta cidade já está cadastrada.' });
      }

      const result = await run(db, 'INSERT INTO cities (name) VALUES (?)', [name.trim()]);
      res.json({ success: true, id: result.insertId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE City (Admin only)
  app.delete('/api/cities/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      await run(db, 'DELETE FROM cities WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST Oficineiro account (Admin only) — creates a login bound to a specific workshop
  app.post('/api/oficineiros', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { username, password, workshop_id } = req.body;
      if (!username || !password || !workshop_id) {
        return res.status(400).json({ error: 'Usuário, senha e oficina são obrigatórios.' });
      }

      const workshop = await queryOne(db, 'SELECT id FROM workshops WHERE id = ?', [workshop_id]);
      if (!workshop) {
        return res.status(400).json({ error: 'Oficina não encontrada.' });
      }

      const existing = await queryOne(db, 'SELECT id FROM users WHERE username = ?', [username.trim()]);
      if (existing) {
        return res.status(400).json({ error: 'Já existe um usuário com este nome.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const result = await run(
        db,
        'INSERT INTO users (username, password_hash, role, workshop_id) VALUES (?, ?, ?, ?)',
        [username.trim(), passwordHash, 'oficineiro', workshop_id]
      );

      res.json({ success: true, id: result.insertId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET Oficineiro accounts (Admin only)
  app.get('/api/oficineiros', requireAuth, requireAdmin, async (req, res) => {
    try {
      const rows = await queryAll(db, `
        SELECT u.id, u.username, u.workshop_id, w.title as workshop_title
        FROM users u
        LEFT JOIN workshops w ON u.workshop_id = w.id
        WHERE u.role = 'oficineiro'
        ORDER BY u.username ASC
      `);
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE Oficineiro account (Admin only)
  app.delete('/api/oficineiros/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      await run(db, `DELETE FROM users WHERE id = ? AND role = 'oficineiro'`, [req.params.id]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET Stats (Admin only)
  app.get('/api/stats', requireAuth, requireAdmin, async (req, res) => {
    try {
      const partRes = await queryOne(db, 'SELECT COUNT(*) as count FROM participants');
      const wsRes = await queryOne(db, 'SELECT COUNT(*) as count FROM workshops');
      const surRes = await queryOne(db, 'SELECT COUNT(*) as count FROM surveys');
      const presRes = await queryOne(db, "SELECT COUNT(*) as count FROM attendance WHERE status = 'PRESENTE'");
      const absRes = await queryOne(db, "SELECT COUNT(*) as count FROM attendance WHERE status = 'FALTA'");
      const npsRes = await queryOne(db, 'SELECT AVG(recommendation_nps) as avg_nps FROM surveys');

      res.json({
        total_participants: partRes?.count || 0,
        total_workshops: wsRes?.count || 0,
        total_surveys: surRes?.count || 0,
        total_present: presRes?.count || 0,
        total_absent: absRes?.count || 0,
        nps_score: Math.round((npsRes?.avg_nps || 0) * 10) / 10
      });
    } catch (err: any) {
      console.error('Erro /api/stats:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET Workshops with Participant Details & Attendance for Oficineiros.
  // Public (used by the anonymous survey to list workshops), but a logged-in
  // oficineiro (non-admin) only sees their own assigned workshop.
  app.get('/api/workshops', optionalAuth, async (req, res) => {
    try {
      const isOficineiro = req.session?.role === 'oficineiro';
      const workshopFilter = isOficineiro ? 'WHERE w.id = ?' : '';
      const filterParams = isOficineiro ? [req.session!.workshopId] : [];

      const workshops = await queryAll(db, `
        SELECT w.*,
          (SELECT COUNT(*) FROM attendance a WHERE a.workshop_id = w.id AND a.status = 'PRESENTE') as present_count,
          (SELECT COUNT(*) FROM attendance a WHERE a.workshop_id = w.id AND a.status = 'FALTA') as absent_count
        FROM workshops w
        ${workshopFilter}
        ORDER BY w.time_slot, w.id
      `, filterParams);

      // Attach participants list to each workshop for oficineiros
      const fullWorkshops = await Promise.all(workshops.map(async w => {
        const parts = await queryAll(db, `
          SELECT p.id, p.name, c.name as city, p.family_group, a.status as attendance_status
          FROM participants p
          LEFT JOIN cities c ON p.city_id = c.id
          LEFT JOIN attendance a ON a.participant_id = p.id AND a.workshop_id = ?
          WHERE p.workshop1_id = ? OR p.workshop2_id = ?
          ORDER BY p.name ASC
        `, [w.id, w.id, w.id]);

        return {
          ...w,
          total_enrolled: parts.length,
          participants: parts
        };
      }));

      res.json(fullWorkshops);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST Workshop (Admin only)
  app.post('/api/workshops', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { title, instructor, location, time_slot, max_slots } = req.body;
      if (!title || !instructor || !location) {
        return res.status(400).json({ error: 'Título, oficineiro e local são obrigatórios.' });
      }

      const result = await run(
        db,
        `INSERT INTO workshops (title, instructor, location, time_slot, max_slots) VALUES (?, ?, ?, ?, ?)`,
        [title, instructor, location, time_slot || '1ª Oficina', max_slots || 30]
      );

      res.json({ success: true, id: result.insertId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET Participants with Workshops & Attendance Status
  app.get('/api/participants', requireAuth, requireAdmin, async (req, res) => {
    try {
      const rows = await queryAll(db, `
        SELECT
          p.*,
          c.name as city,
          w1.title as workshop1_title,
          w2.title as workshop2_title,
          a1.status as attendance1_status,
          a2.status as attendance2_status
        FROM participants p
        LEFT JOIN cities c ON p.city_id = c.id
        LEFT JOIN workshops w1 ON p.workshop1_id = w1.id
        LEFT JOIN workshops w2 ON p.workshop2_id = w2.id
        LEFT JOIN attendance a1 ON p.id = a1.participant_id AND p.workshop1_id = a1.workshop_id
        LEFT JOIN attendance a2 ON p.id = a2.participant_id AND p.workshop2_id = a2.workshop_id
        ORDER BY p.name ASC
      `);
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST Participant (Admin only)
  app.post('/api/participants', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { name, city_id, family_group, workshop1_id, workshop2_id } = req.body;
      if (!name || !city_id) {
        return res.status(400).json({ error: 'Nome e Cidade são obrigatórios.' });
      }

      const result = await run(
        db,
        `INSERT INTO participants (name, city_id, family_group, workshop1_id, workshop2_id) VALUES (?, ?, ?, ?, ?)`,
        [name, city_id, family_group || 'Família MFC', workshop1_id || null, workshop2_id || null]
      );

      res.json({ success: true, id: result.insertId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE Participant (Admin only)
  app.delete('/api/participants/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await run(db, `DELETE FROM attendance WHERE participant_id = ?`, [id]);
      await run(db, `DELETE FROM participants WHERE id = ?`, [id]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST Attendance (Presença / Falta) — an oficineiro may only mark attendance for their own workshop
  app.post('/api/attendance', requireAuth, async (req, res) => {
    try {
      const { participant_id, workshop_id, status } = req.body;
      if (!participant_id || !workshop_id || !['PRESENTE', 'FALTA'].includes(status)) {
        return res.status(400).json({ error: 'Parâmetros inválidos para chamada.' });
      }

      if (req.session?.role === 'oficineiro' && req.session.workshopId !== Number(workshop_id)) {
        return res.status(403).json({ error: 'Você só pode marcar presença na sua própria oficina.' });
      }

      await run(
        db,
        `INSERT INTO attendance (participant_id, workshop_id, status) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), marked_at = CURRENT_TIMESTAMP`,
        [participant_id, workshop_id, status]
      );

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET Survey Averages & Dashboard Data (Admin only)
  app.get('/api/surveys', requireAuth, requireAdmin, async (req, res) => {
    try {
      const countRes = await queryOne(db, 'SELECT COUNT(*) as total FROM surveys');
      const total = countRes?.total || 0;

      if (total === 0) {
        return res.json({
          total_surveys: 0,
          avg_overall_score: 0,
          nps_score: 0,
          averages: {
            pre_study: 0, marketing: 0, welcome: 0, checkin: 0,
            infra_accommodation: 0, infra_breakfast: 0, infra_lunch: 0,
            infra_dinner: 0, infra_restrooms: 0, infra_tech: 0, infra_lodging: 0,
            youth_moment: 0, mirim_moment: 0, animation: 0, mass: 0, liturgy: 0, eco_friendly: 0
          },
          workshop_ratings: [],
          recent_testimonials: [],
          recent_suggestions: []
        });
      }

      const avgs = await queryOne(db, `
        SELECT
          AVG(pre_study_rating) as pre_study,
          AVG(marketing_rating) as marketing,
          AVG(welcome_rating) as welcome,
          AVG(checkin_rating) as checkin,
          AVG(infra_accommodation) as infra_accommodation,
          AVG(infra_breakfast) as infra_breakfast,
          AVG(infra_lunch) as infra_lunch,
          AVG(infra_dinner) as infra_dinner,
          AVG(infra_restrooms) as infra_restrooms,
          AVG(infra_tech) as infra_tech,
          AVG(CASE WHEN infra_lodging_used = 1 THEN infra_lodging_rating ELSE NULL END) as infra_lodging,
          AVG(youth_moment_rating) as youth_moment,
          AVG(mirim_moment_rating) as mirim_moment,
          AVG(animation_rating) as animation,
          AVG(mass_rating) as mass,
          AVG(liturgy_rating) as liturgy,
          AVG(eco_friendly_rating) as eco_friendly,
          AVG(recommendation_nps) as nps
        FROM surveys
      `);

      const workshops = await queryAll(db, 'SELECT * FROM workshops');
      const workshop_ratings = await Promise.all(workshops.map(async w => {
        const r = await queryOne(db, `
          SELECT
            AVG(rating) as avg_rating,
            COUNT(*) as total_votes
          FROM (
            SELECT workshop1_rating as rating FROM surveys WHERE workshop1_id = ?
            UNION ALL
            SELECT workshop2_rating as rating FROM surveys WHERE workshop2_id = ?
          ) t
        `, [w.id, w.id]);

        return {
          workshop_id: w.id,
          workshop_title: w.title,
          avg_rating: Math.round((r?.avg_rating || 0) * 10) / 10,
          total_votes: r?.total_votes || 0
        };
      }));

      const testimonials = await queryAll(db, `
        SELECT recommendation_text as text, recommendation_nps as nps, created_at as date
        FROM surveys
        WHERE recommendation_text IS NOT NULL AND TRIM(recommendation_text) != ''
        ORDER BY id DESC LIMIT 10
      `);

      const suggestions = await queryAll(db, `
        SELECT general_suggestions as text, created_at as date
        FROM surveys
        WHERE general_suggestions IS NOT NULL AND TRIM(general_suggestions) != ''
        ORDER BY id DESC LIMIT 10
      `);

      const overallSum = (
        (avgs.welcome || 5) + (avgs.checkin || 5) + (avgs.mass || 5) +
        (avgs.animation || 5) + (avgs.liturgy || 5) + (avgs.eco_friendly || 5)
      ) / 6;

      const formatAvg = (val: any) => Math.round((val || 0) * 10) / 10;

      res.json({
        total_surveys: total,
        avg_overall_score: formatAvg(overallSum),
        nps_score: formatAvg(avgs.nps),
        averages: {
          pre_study: formatAvg(avgs.pre_study),
          marketing: formatAvg(avgs.marketing),
          welcome: formatAvg(avgs.welcome),
          checkin: formatAvg(avgs.checkin),
          infra_accommodation: formatAvg(avgs.infra_accommodation),
          infra_breakfast: formatAvg(avgs.infra_breakfast),
          infra_lunch: formatAvg(avgs.infra_lunch),
          infra_dinner: formatAvg(avgs.infra_dinner),
          infra_restrooms: formatAvg(avgs.infra_restrooms),
          infra_tech: formatAvg(avgs.infra_tech),
          infra_lodging: formatAvg(avgs.infra_lodging),
          youth_moment: formatAvg(avgs.youth_moment),
          mirim_moment: formatAvg(avgs.mirim_moment),
          animation: formatAvg(avgs.animation),
          mass: formatAvg(avgs.mass),
          liturgy: formatAvg(avgs.liturgy),
          eco_friendly: formatAvg(avgs.eco_friendly)
        },
        workshop_ratings,
        recent_testimonials: testimonials,
        recent_suggestions: suggestions
      });
    } catch (err: any) {
      console.error('Erro /api/surveys:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // POST Anonymous Survey Submission
  app.post('/api/surveys', async (req, res) => {
    try {
      const s = req.body;

      await run(db, `
        INSERT INTO surveys (
          pre_study_rating, pre_study_comment,
          marketing_rating, marketing_comment,
          welcome_rating, checkin_rating,
          infra_accommodation, infra_breakfast, infra_lunch, infra_dinner, infra_restrooms, infra_tech,
          infra_lodging_used, infra_lodging_rating,
          workshop1_id, workshop1_rating, workshop2_id, workshop2_rating,
          youth_moment_rating, mirim_moment_rating, animation_rating, mass_rating, liturgy_rating, eco_friendly_rating,
          recommendation_text, recommendation_nps, general_suggestions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        s.pre_study_rating || 5, s.pre_study_comment || '',
        s.marketing_rating || 5, s.marketing_comment || '',
        s.welcome_rating || 5, s.checkin_rating || 5,
        s.infra_accommodation || 5, s.infra_breakfast || 5, s.infra_lunch || 5, s.infra_dinner || 5, s.infra_restrooms || 5, s.infra_tech || 5,
        s.infra_lodging_used ? 1 : 0, s.infra_lodging_rating || 5,
        s.workshop1_id || null, s.workshop1_rating || 5,
        s.workshop2_id || null, s.workshop2_rating || 5,
        s.youth_moment_rating || 5, s.mirim_moment_rating || 5, s.animation_rating || 5, s.mass_rating || 5, s.liturgy_rating || 5, s.eco_friendly_rating || 5,
        s.recommendation_text || '', s.recommendation_nps || 10, s.general_suggestions || ''
      ]);

      res.json({ success: true, message: 'Pesquisa enviada com sucesso!' });
    } catch (err: any) {
      console.error('Erro ao salvar pesquisa:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // POST Reset event data (workshops, participants, attendance, surveys) — keeps cities & users
  app.post('/api/seed', requireAuth, requireAdmin, async (req, res) => {
    try {
      await seedInitialData(db);
      res.json({ success: true, message: 'Dados do evento resetados!' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server 5º EPA Pirassununga rodando na porta ${PORT}`);
  });
}

startServer();
