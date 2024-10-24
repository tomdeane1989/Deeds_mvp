import React, { useState, useEffect } from 'react';
import {
  Button, Typography, Card, CardContent, CardActions, Grid, Dialog, DialogActions, DialogContent, DialogTitle, TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import axios from 'axios';

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  });
  const [editProject, setEditProject] = useState({
    name: '',
    description: ''
  });

  const navigate = useNavigate(); // Initialize useNavigate for redirection

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

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from local storage
    navigate('/login'); // Redirect to login page
  };

  // Open/Close dialog handlers for creating a new project
  const handleClickOpenCreate = () => {
    setOpenCreate(true);
  };

  const handleCloseCreate = () => {
    setOpenCreate(false);
  };

  // Open/Close dialog handlers for editing a project
  const handleClickOpenEdit = (project) => {
    setCurrentProject(project);
    setEditProject({
      name: project.name,
      description: project.description
    });
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
  };

  // Handle input change for the new project form
  const handleInputChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  // Handle input change for the edit project form
  const handleEditInputChange = (e) => {
    setEditProject({ ...editProject, [e.target.name]: e.target.value });
  };

  // Handle form submission for creating a project
  const handleSubmitCreate = () => {
    axios.post('http://localhost:5001/projects', newProject, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(response => {
        setProjects([...projects, response.data]); // Add the new project to the list
        setNewProject({ name: '', description: '' }); // Reset the form
        handleCloseCreate(); // Close the dialog
      })
      .catch(error => {
        console.error('Error creating project:', error);
      });
  };

  // Handle form submission for editing a project
  const handleSubmitEdit = () => {
    axios.put(`http://localhost:5001/projects/${currentProject.id}`, editProject, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(response => {
        setProjects(projects.map((proj) =>
          proj.id === currentProject.id ? response.data.project : proj
        )); // Update the edited project in the list
        handleCloseEdit(); // Close the dialog
      })
      .catch(error => {
        console.error('Error updating project:', error);
      });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        Your Projects
      </Typography>

      <Button variant="contained" color="primary" onClick={handleClickOpenCreate} style={{ marginBottom: '20px' }}>
        Create New Project
      </Button>

      {/* Dialog for creating a new project */}
      <Dialog open={openCreate} onClose={handleCloseCreate}>
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
          <Button onClick={handleCloseCreate} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmitCreate} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for editing a project */}
      <Dialog open={openEdit} onClose={handleCloseEdit}>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Project Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editProject.name}
            onChange={handleEditInputChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Project Description"
            type="text"
            fullWidth
            variant="outlined"
            value={editProject.description}
            onChange={handleEditInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmitEdit} color="primary">
            Save Changes
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
                  <Typography variant="caption" color="text.secondary">
                    Project ID: {project.id}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" variant="contained" color="primary">
                    View Details
                  </Button>
                  <Button size="small" variant="contained" color="secondary" onClick={() => handleClickOpenEdit(project)}>
                    Edit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Logout Button */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Project;