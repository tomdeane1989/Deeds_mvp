import React, { useState, useEffect } from 'react';
import {
  Button, Typography, Card, CardContent, CardActions, Grid, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    role: '' // New field for project-specific role
  });

  const [editProject, setEditProject] = useState({
    name: '',
    description: ''
  });

  const navigate = useNavigate(); // Hook to handle navigation

  // Fetch projects and user role from the API when component mounts
  useEffect(() => {
    axios.get('http://localhost:5001/projects', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(response => {
        setProjects(response.data.projects); // Store projects data including roles
      })
      .catch(error => {
        console.error('Error fetching projects:', error);
      });
  }, []);

  // Handlers for opening/closing create dialog
  const handleClickOpenCreate = () => {
    setOpenCreate(true);
  };

  const handleCloseCreate = () => {
    setOpenCreate(false);
  };

  // Handlers for opening/closing edit dialog
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

  // Handle input changes for creating a new project
  const handleInputChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  // Handle role selection change
  const handleRoleChange = (e) => {
    setNewProject({ ...newProject, role: e.target.value });
  };

  // Handle input changes for editing a project
  const handleEditInputChange = (e) => {
    setEditProject({ ...editProject, [e.target.name]: e.target.value });
  };

  // Handle creating a new project
  const handleSubmitCreate = () => {
    const projectData = {
      name: newProject.name,
      description: newProject.description,
      userRole: newProject.role // Correctly assign userRole to send to backend
    };

    axios.post('http://localhost:5001/projects', projectData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(response => {
        setProjects([...projects, response.data]); // Add the new project to the list
        setNewProject({ name: '', description: '', role: '' }); // Reset the form
        handleCloseCreate(); // Close the dialog
      })
      .catch(error => {
        console.error('Error creating project:', error);
      });
  };

  // Handle editing a project
  const handleSubmitEdit = () => {
    axios.put(`http://localhost:5001/projects/${currentProject.id}`, editProject, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(response => {
        setProjects(projects.map((proj) =>
          proj.id === currentProject.id ? response.data : proj
        )); // Update the edited project in the list
        handleCloseEdit(); // Close the dialog
      })
      .catch(error => {
        console.error('Error updating project:', error);
      });
  };

  // Handle logging out
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
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
          <FormControl fullWidth margin="dense">
            <InputLabel id="role-select-label">Select Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={newProject.role}
              onChange={handleRoleChange}
              label="Select Role"
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Buyer">Buyer</MenuItem>
              <MenuItem value="Seller">Seller</MenuItem>
              <MenuItem value="Agent">Agent</MenuItem>
              <MenuItem value="Solicitor">Solicitor</MenuItem>
              <MenuItem value="Mortgage Advisor">Mortgage Advisor</MenuItem>
            </Select>
          </FormControl>
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
                  {/* Separate divs for Project ID and Role */}
                  <div>
                    <Typography variant="caption" color="text.secondary">
                      Project ID: {project.id}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="caption" color="text.secondary">
                      Role: {project.role}
                    </Typography>
                  </div>
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

      {/* Logout button */}
      <Button onClick={handleLogout} variant="contained" color="secondary" style={{ marginTop: '20px' }}>
        Logout
      </Button>
    </div>
  );
};

export default Project;