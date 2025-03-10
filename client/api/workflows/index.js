const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Helper function to create a serverless function handler
const createHandler = (handler) => async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Create a next function for middleware
  const next = () => handler(req, res);

  // Apply auth middleware
  await auth(req, res, next);
};

// GET all workflows
module.exports = createHandler(async (req, res) => {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', req.user.id);

      if (error) throw error;
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert([{ ...req.body, user_id: req.user.id }])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}); 