import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Container, Typography, Box, List, ListItem, ListItemText, IconButton, Collapse, LinearProgress, Checkbox, ListItemIcon } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const availableRoles = ['admin', 'buyer', 'seller', 'agent', 'solicitor', 'mortgage_advisor'];

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  const [status, setStatus] = useState('in progress');
  const [editRoles, setEditRoles] = useState([]);  // Add state for editRoles
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentTask, setCurrentTask] = useState({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(response.data.tasks);
      } catch (error) {
        setMessage('Error fetching tasks');
      }
    };

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

    fetchTasks();
    fetchMilestones();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/tasks', {
        title,
        description,
        dueDate,
        milestoneId,
        status,
        editRoles  // Include editRoles when creating the task
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks([...tasks, response.data.task]);
      setTitle('');
      setDescription('');
      setDueDate('');
      setMilestoneId('');
      setStatus('in progress');
      setEditRoles([]);  // Reset roles after task creation
      setMessage('Task created successfully');
      setShowForm(false);
    } catch (error) {
      setMessage('Error creating task');
    }
  };

  const handleEdit = (task) => {
    setEditMode(true);
    setCurrentTask(task);
    setShowForm(false);  // Hide create form when editing
  };

  const updateTask = async () => {
    console.log('Updating task:', currentTask);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/tasks/${currentTask.id}`, currentTask, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(tasks.map(task => task.id === currentTask.id ? currentTask : task));
      setEditMode(false);
      setMessage('Task updated successfully');
    } catch (error) {
      setMessage('Error updating task');
    }
  };

  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      setMessage('Error deleting task');
    }
  };

  // Group tasks by milestones
  const groupedTasks = milestones.map(milestone => ({
    ...milestone,
    tasks: tasks.filter(task => task.milestoneId === milestone.id)
  }));

  // Calculate progress for each milestone
  const calculateProgress = (tasks) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
  };

  const handleRoleChange = (role) => {
    if (editRoles.includes(role)) {
      setEditRoles(editRoles.filter((r) => r !== role));
    } else {
      setEditRoles([...editRoles, role]);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Tasks Management</Typography>

      <Button variant="contained" color="primary" onClick={() => setShowForm(!showForm)} sx={{ mb: 2 }}>
        {showForm ? 'Close Form' : 'Create Task'}
      </Button>

      <Collapse in={showForm}>
        <Box component="form" onSubmit={handleCreateTask} sx={{ mb: 3 }}>
          <TextField
            label="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Task Description"
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
          <FormControl fullWidth margin="normal">
            <InputLabel>Milestone</InputLabel>
            <Select
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
            >
              <MenuItem value=""><em>No Milestone</em></MenuItem>
              {milestones.map((milestone) => (
                <MenuItem key={milestone.id} value={milestone.id}>
                  {milestone.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="in progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          
          {/* Multi-select for edit roles */}
          <Typography variant="body1" sx={{ mt: 2 }}>Assign Roles with Edit Access:</Typography>
          {availableRoles.map((role) => (
            <ListItem key={role} button onClick={() => handleRoleChange(role)}>
              <ListItemIcon>
                <Checkbox checked={editRoles.includes(role)} />
              </ListItemIcon>
              <ListItemText primary={role} />
            </ListItem>
          ))}

          <Button variant="contained" color="primary" type="submit">
            Create Task
          </Button>
        </Box>
      </Collapse>

      {message && <Typography color="error">{message}</Typography>}

      <Typography variant="h5" gutterBottom>Tasks Grouped by Milestones</Typography>

      {groupedTasks.map(group => (
        <div key={group.id}>
          <Typography variant="h6">{group.title}</Typography>
          <LinearProgress variant="determinate" value={calculateProgress(group.tasks)} sx={{ mb: 2 }} />
          <List>
            {group.tasks.length > 0 ? group.tasks.map(task => (
              <ListItem key={task.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <ListItemText 
                  primary={`${task.title} - ${task.description} (Due: ${task.dueDate})`} 
                  secondary={`Status: ${task.status} - Milestone: ${milestones.find(m => m.id === task.milestoneId)?.title || 'None'}`}
                />
                <Box>
                  <IconButton color="secondary" onClick={() => handleEdit(task)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => deleteTask(task.id)}>
                    <Delete />
                  </IconButton>
                </Box>
              </ListItem>
            )) : <Typography>No tasks for this milestone</Typography>}
          </List>
        </div>
      ))}

      {editMode && (
        <Box>
          <Typography variant="h6">Edit Task</Typography>
          <TextField
            label="Task Title"
            value={currentTask.title || ''}
            onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Task Description"
            value={currentTask.description || ''}
            onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
            multiline
            rows={3}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Due Date"
            type="date"
            value={currentTask.dueDate ? currentTask.dueDate.split('T')[0] : ''}
            onChange={(e) => setCurrentTask({ ...currentTask, dueDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Milestone</InputLabel>
            <Select
              value={currentTask.milestoneId || ''}
              onChange={(e) => setCurrentTask({ ...currentTask, milestoneId: e.target.value })}
            >
              <MenuItem value=""><em>No Milestone</em></MenuItem>
              {milestones.map((milestone) => (
                <MenuItem key={milestone.id} value={milestone.id}>
                  {milestone.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={currentTask.status || ''}
              onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value })}
            >
              <MenuItem value="in progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={updateTask}>
            Update Task
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default Tasks;