import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, Collapse, List, ListItem, ListItemText, IconButton, LinearProgress } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material'; // Icons for edit and delete

function MilestoneManager() {
  const [milestones, setMilestones] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState(null);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false); // State to toggle form visibility

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/milestones', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMilestones(response.data.milestones);
    } catch (error) {
      setMessage('Error fetching milestones');
    }
  };

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/milestones', {
        title,
        description,
        dueDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMilestones([...milestones, response.data.milestone]);
      setTitle('');
      setDescription('');
      setDueDate('');
      setMessage('Milestone created successfully');
      setShowForm(false);  // Hide form after creation
    } catch (error) {
      setMessage('Error creating milestone');
    }
  };

  const handleEdit = (milestone) => {
    setEditMode(true);
    setCurrentMilestone(milestone);
    setTitle(milestone.title);
    setDescription(milestone.description);
    setDueDate(milestone.dueDate.split('T')[0]);
    setShowForm(true);  // Show the form for editing
  };

  const updateMilestone = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/milestones/${currentMilestone.id}`, {
        title,
        description,
        dueDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMilestones(milestones.map(milestone => milestone.id === currentMilestone.id ? { ...milestone, title, description, dueDate } : milestone));
      setEditMode(false);
      setMessage('Milestone updated successfully');
      setShowForm(false);  // Hide form after update
    } catch (error) {
      setMessage('Error updating milestone');
    }
  };

  const deleteMilestone = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/milestones/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMilestones(milestones.filter(milestone => milestone.id !== id));
      setMessage('Milestone deleted successfully');
    } catch (error) {
      setMessage('Error deleting milestone');
    }
  };

  // Calculate progress for any related tasks or milestone progress (optional)
  const calculateProgress = (tasks) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Milestone Management</Typography>
      
      <Button variant="contained" color="primary" onClick={() => setShowForm(!showForm)} sx={{ mb: 2 }}>
        {showForm ? 'Close Form' : 'Create Milestone'}
      </Button>

      <Collapse in={showForm}>  {/* This will show/hide the form */}
        <Box component="form" onSubmit={editMode ? updateMilestone : handleCreateMilestone} sx={{ mb: 3 }}>
          <TextField
            label="Milestone Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Milestone Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" type="submit">
            {editMode ? 'Update Milestone' : 'Create Milestone'}
          </Button>
        </Box>
      </Collapse>

      {message && <Typography color="error">{message}</Typography>}

      <Typography variant="h5" gutterBottom>Milestones List</Typography>
      <List>
        {milestones.map((milestone) => (
          <ListItem key={milestone.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <ListItemText 
              primary={`${milestone.title} - ${milestone.description}`} 
              secondary={`Due: ${milestone.dueDate}`} 
            />
            <Box>
              <IconButton color="secondary" onClick={() => handleEdit(milestone)}>
                <Edit />
              </IconButton>
              <IconButton color="error" onClick={() => deleteMilestone(milestone.id)}>
                <Delete />
              </IconButton>
            </Box>
            {/* Optional Progress Indicator if there are tasks related to this milestone */}
            <LinearProgress variant="determinate" value={calculateProgress(milestone.tasks || [])} sx={{ mt: 2 }} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default MilestoneManager;