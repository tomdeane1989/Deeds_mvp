import React, { useState, useEffect } from 'react';
import { Button, Typography, Card, CardContent, CardActions, Grid, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import axios from 'axios';

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  });

  // Fetch projects from the API on component load
  useEffect(() => {
    axios.get('http://localhost:5001/projects', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(response => {
        setProjects(response.data.projects);
      })
      .catch(error => {
        console.error('Error fetching projects:', error);
      });
  }, []);

  // Open/Close dialog handlers
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Handle input change for the new project form
  const handleInputChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = () => {
    axios.post('http://localhost:5001/projects', newProject, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(response => {
        setProjects([...projects, response.data]); // Add the new project to the list
        setNewProject({ name: '', description: '' }); // Reset the form
        handleClose(); // Close the dialog
      })
      .catch(error => {
        console.error('Error creating project:', error);
      });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        Your Projects
      </Typography>

      <Button variant="contained" color="primary" onClick={handleClickOpen} style={{ marginBottom: '20px' }}>
        Create New Project
      </Button>

      {/* Dialog for creating a new project */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Project Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newProject.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Project Description"
            type="text"
            fullWidth
            variant="outlined"
            value={newProject.description}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={3}>
        {projects.length === 0 ? (
          <Typography variant="body1">No projects found. Create a new one!</Typography>
        ) : (
          projects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <Card style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" variant="contained" color="primary">
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </div>
  );
};

export default Project;