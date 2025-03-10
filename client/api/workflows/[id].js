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

module.exports = createHandler(async (req, res) => {
  // Get the workflow ID from the URL
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .update(req.body)
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ message: 'Workflow not found' });
      }
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user.id);

      if (error) throw error;
      res.status(200).json({ message: 'Workflow deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}); 