import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const db = new Database('helios.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    balance REAL DEFAULT 1000.0
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT,
    location TEXT,
    capacity TEXT,
    total_shares INTEGER,
    available_shares INTEGER,
    price_per_share REAL,
    expected_yield REAL,
    status TEXT,
    image TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS investments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    project_id TEXT,
    shares INTEGER,
    amount REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT, -- 'purchase', 'dividend', 'deposit', 'withdrawal'
    project_name TEXT,
    amount REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Seed projects if empty
const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
if (projectCount.count === 0) {
  const insertProject = db.prepare(`
    INSERT INTO projects (id, name, location, capacity, total_shares, available_shares, price_per_share, expected_yield, status, image, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProject.run('1', 'Desert Sun Array', 'Mojave Desert, CA', '1.2 MW', 10000, 2450, 50, 8.5, 'funding', 'https://picsum.photos/seed/solar1/800/600', 'A large-scale utility project providing clean energy to the local grid.');
  insertProject.run('2', 'Green Roof Initiative', 'Brooklyn, NY', '250 kW', 5000, 120, 75, 6.2, 'active', 'https://picsum.photos/seed/solar2/800/600', 'Urban solar installation on commercial rooftops.');
  insertProject.run('3', 'Azure Plains Farm', 'Castile, Spain', '5 MW', 50000, 15000, 40, 9.1, 'funding', 'https://picsum.photos/seed/solar3/800/600', 'Expansive solar farm in one of Europe\'s sunniest regions.');
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Auth Routes
  app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body;
    try {
      const info = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run(email, password, name);
      res.json({ id: info.lastInsertRowid, email, name, balance: 1000.0 });
    } catch (e) {
      res.status(400).json({ error: 'Email already exists' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password, isSupabase } = req.body;
    
    if (isSupabase) {
      // For Supabase users, we just need to ensure they exist in our local DB
      let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      if (!user) {
        // Create a local profile for the Supabase user if it doesn't exist
        const info = db.prepare('INSERT INTO users (email, name) VALUES (?, ?)').run(email, email.split('@')[0]);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
      }
      return res.json({ id: user.id, email: user.email, name: user.name, balance: user.balance });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password) as any;
    if (user) {
      res.json({ id: user.id, email: user.email, name: user.name, balance: user.balance });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  // Project Routes
  app.get('/api/projects', (req, res) => {
    const projects = db.prepare('SELECT * FROM projects').all();
    res.json(projects);
  });

  // Investment Routes
  app.post('/api/invest', (req, res) => {
    const { userId, projectId, shares } = req.body;
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

    if (!project || !user) return res.status(404).json({ error: 'Not found' });
    
    const amount = project.price_per_share * shares;
    if (user.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });
    if (project.available_shares < shares) return res.status(400).json({ error: 'Not enough shares available' });

    const transaction = db.transaction(() => {
      db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(amount, userId);
      db.prepare('UPDATE projects SET available_shares = available_shares - ? WHERE id = ?').run(shares, projectId);
      db.prepare('INSERT INTO investments (user_id, project_id, shares, amount) VALUES (?, ?, ?, ?)').run(userId, projectId, shares, amount);
      db.prepare('INSERT INTO transactions (user_id, type, project_name, amount) VALUES (?, ?, ?, ?)').run(userId, 'purchase', project.name, -amount);
    });

    transaction();
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    res.json(updatedUser);
  });

  app.get('/api/user/:userId/investments', (req, res) => {
    const investments = db.prepare(`
      SELECT i.*, p.name as project_name, p.location, p.image, p.expected_yield 
      FROM investments i 
      JOIN projects p ON i.project_id = p.id 
      WHERE i.user_id = ?
    `).all(req.params.userId);
    res.json(investments);
  });

  app.get('/api/user/:userId/transactions', (req, res) => {
    const txs = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC').all(req.params.userId);
    res.json(txs);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => res.sendFile(path.resolve('dist/index.html')));
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
