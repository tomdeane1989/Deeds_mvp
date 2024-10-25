import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Collapse, List, ListItem, ListItemText, IconButton, LinearProgress, Stack } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

function Milestone() {
  const [milestones, setMilestones] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState(null);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { projectId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  const fetchMilestones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/projects/${projectId}/milestones`, {
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
      const response = await axios.post(`http://localhost:5001/projects/${projectId}/milestones`, {
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
      setShowForm(false);
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
    setShowForm(true);
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
      setShowForm(false);
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

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  const calculateProgress = (tasks) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Milestone Management</Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button variant="contained" color="secondary" onClick={handleBackToProjects}>
          Back to Projects
        </Button>
        <Button variant="contained" color="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close Form' : 'Create Milestone'}
        </Button>
      </Stack>

      <Collapse in={showForm}>
        <Box component="form" onSubmit={editMode ? updateMilestone : handleCreateMilestone} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
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
          <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
            {editMode ? 'Update Milestone' : 'Create Milestone'}
          </Button>
        </Box>
      </Collapse>

      {message && <Typography color="error">{message}</Typography>}

      <Typography variant="h5" gutterBottom>Milestones List</Typography>
      <List>
        {milestones.map((milestone) => (
          <ListItem key={milestone.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
            <ListItemText 
              primary={<Typography variant="subtitle1">{milestone.title}</Typography>} 
              secondary={`Due: ${milestone.dueDate} - ${milestone.description}`} 
            />
            <Box display="flex" alignItems="center">
              <IconButton color="secondary" onClick={() => handleEdit(milestone)}>
                <Edit />
              </IconButton>
              <IconButton color="error" onClick={() => deleteMilestone(milestone.id)}>
                <Delete />
              </IconButton>
            </Box>
            <LinearProgress variant="determinate" value={calculateProgress(milestone.tasks || [])} sx={{ mt: 1, width: '100%' }} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default Milestone;