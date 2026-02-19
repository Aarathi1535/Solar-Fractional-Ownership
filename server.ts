import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://auedauimefznpumwatcs.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DM-qtQE9Qk7lfEivKrUmmQ_5z4wgCbT';

console.log('Initializing Supabase with URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedProjects() {
  try {
    const { data: projects, error } = await supabase.from('projects').select('id');
    if (error) {
      console.error('Error checking projects:', error.message);
      return;
    }
    if (projects && projects.length === 0) {
      console.log('Seeding projects to Supabase...');
      const { error: insertError } = await supabase.from('projects').insert([
        {
          id: '1',
          name: 'Desert Sun Array',
          location: 'Mojave Desert, CA',
          capacity: '1.2 MW',
          total_shares: 10000,
          available_shares: 2450,
          price_per_share: 50,
          expected_yield: 8.5,
          status: 'funding',
          image: 'https://picsum.photos/seed/solar1/800/600',
          description: 'A large-scale utility project providing clean energy to the local grid.'
        },
        {
          id: '2',
          name: 'Green Roof Initiative',
          location: 'Brooklyn, NY',
          capacity: '250 kW',
          total_shares: 5000,
          available_shares: 120,
          price_per_share: 75,
          expected_yield: 6.2,
          status: 'active',
          image: 'https://picsum.photos/seed/solar2/800/600',
          description: 'Urban solar installation on commercial rooftops.'
        },
        {
          id: '3',
          name: 'Azure Plains Farm',
          location: 'Castile, Spain',
          capacity: '5 MW',
          total_shares: 50000,
          available_shares: 15000,
          price_per_share: 40,
          expected_yield: 9.1,
          status: 'funding',
          image: 'https://picsum.photos/seed/solar3/800/600',
          description: 'Expansive solar farm in one of Europe\'s sunniest regions.'
        }
      ]);
      if (insertError) console.error('Error seeding projects:', insertError.message);
    }
  } catch (e) {
    console.error('Seed failed:', e);
  }
}

async function startServer() {
  await seedProjects();
  const app = express();
  app.use(express.json());

  // Auth Routes - Fetch profile from Supabase Profiles table
  app.post('/api/auth/login', async (req, res) => {
    const { id, email, isSupabase } = req.body;
    console.log('Profile fetch request for ID:', id);
    
    if (isSupabase) {
      let profile = null;
      let fetchError = null;

      // Retry logic: The Supabase trigger might take a few milliseconds to create the profile
      for (let i = 0; i < 3; i++) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (data) {
          profile = data;
          break;
        }
        fetchError = error;
        console.log(`Retry ${i + 1}: Profile not found yet for ${id}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (!profile) {
        console.error('Fetch profile error after retries:', fetchError);
        return res.status(500).json({ error: fetchError?.message || 'Profile not found' });
      }

      // Return profile with email (even if email isn't in the profiles table yet)
      return res.json({ ...profile, email });
    }

    res.status(400).json({ error: 'Direct login not supported. Use Supabase Auth.' });
  });

  // Project Routes
  app.get('/api/projects', async (req, res) => {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // Investment Routes
  app.post('/api/invest', async (req, res) => {
    const { userId, projectId, shares } = req.body;

    // 1. Fetch project and profile
    const { data: project, error: pError } = await supabase.from('projects').select('*').eq('id', projectId).single();
    const { data: profile, error: uError } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (pError || uError) return res.status(404).json({ error: 'Project or Profile not found' });
    
    const amount = project.price_per_share * shares;
    if (profile.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });
    if (project.available_shares < shares) return res.status(400).json({ error: 'Not enough shares available' });

    // 2. Perform updates
    const { error: uUpdateError } = await supabase
      .from('profiles')
      .update({ balance: profile.balance - amount })
      .eq('id', userId);

    const { error: pUpdateError } = await supabase
      .from('projects')
      .update({ available_shares: project.available_shares - shares })
      .eq('id', projectId);

    await supabase.from('investments').insert([{
      user_id: userId,
      project_id: projectId,
      shares: shares,
      amount: amount
    }]);

    await supabase.from('transactions').insert([{
      user_id: userId,
      type: 'purchase',
      project_name: project.name,
      amount: -amount
    }]);

    const { data: updatedProfile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    res.json(updatedProfile);
  });

  app.get('/api/user/:userId/investments', async (req, res) => {
    const { data, error } = await supabase
      .from('investments')
      .select(`
        *,
        projects (
          name,
          location,
          image,
          expected_yield
        )
      `)
      .eq('user_id', req.params.userId);

    if (error) return res.status(500).json({ error: error.message });
    
    const flattened = data.map(inv => ({
      ...inv,
      project_name: inv.projects.name,
      location: inv.projects.location,
      image: inv.projects.image,
      expected_yield: inv.projects.expected_yield
    }));

    res.json(flattened);
  });

  app.get('/api/user/:userId/transactions', async (req, res) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('timestamp', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
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
