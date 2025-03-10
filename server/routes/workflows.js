const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');

// Get all workflows for a user
router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new workflow
router.post('/', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workflows')
      .insert([{ ...req.body, user_id: req.user.id }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a workflow
router.put('/:id', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workflows')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a workflow
router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Workflow deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 