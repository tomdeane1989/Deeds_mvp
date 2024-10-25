import React, { useState, useEffect } from 'react';
import {
  Button, Typography, Card, CardContent, CardActions, Grid, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box } from '@mui/material';

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAddCollaborator, setOpenAddCollaborator] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  
  // New Project state
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    role: ''
  });

  // Edit Project state
  const [editProject, setEditProject] = useState({
    name: '',
    description: ''
  });

  // Collaborator state
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaboratorRole, setCollaboratorRole] = useState('');

  const navigate = useNavigate();

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

  // CREATE Project Dialog Handlers
  const handleClickOpenCreate = () => setOpenCreate(true);
  const handleCloseCreate = () => setOpenCreate(false);
  const handleInputChange = (e) => setNewProject({ ...newProject, [e.target.name]: e.target.value });
  const handleRoleChange = (e) => setNewProject({ ...newProject, role: e.target.value });

  // SUBMIT New Project
  const handleSubmitCreate = () => {
    const projectData = {
      name: newProject.name,
      description: newProject.description,
      userRole: newProject.role
    };
    axios.post('http://localhost:5001/projects', projectData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(() => {
        axios.get('http://localhost:5001/projects', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(response => {
          setProjects(response.data.projects);
        })
        .catch(error => console.error('Error fetching updated projects:', error));
        setNewProject({ name: '', description: '', role: '' });
        handleCloseCreate();
      })
      .catch(error => console.error('Error creating project:', error));
  };

  // EDIT Project Dialog Handlers
  const handleClickOpenEdit = (project) => {
    setCurrentProject(project);
    setEditProject({ name: project.name, description: project.description });
    setOpenEdit(true);
  };
  const handleCloseEdit = () => setOpenEdit(false);
  const handleEditInputChange = (e) => setEditProject({ ...editProject, [e.target.name]: e.target.value });

  // SUBMIT Edited Project
  const handleSubmitEdit = () => {
    axios.put(`http://localhost:5001/projects/${currentProject.id}`, editProject, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(() => {
        axios.get('http://localhost:5001/projects', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(response => {
          setProjects(response.data.projects);
        })
        .catch(error => console.error('Error fetching updated projects:', error));
        handleCloseEdit();
      })
      .catch(error => console.error('Error updating project:', error));
  };

  // ADD Collaborator Dialog Handlers
  const handleClickOpenAddCollaborator = (project) => {
    setCurrentProject(project);
    setOpenAddCollaborator(true);
  };
  const handleCloseAddCollaborator = () => setOpenAddCollaborator(false);

  // SUBMIT New Collaborator
  const handleAddCollaborator = () => {
    axios.post(`http://localhost:5001/projects/${currentProject.id}/add-collaborator`, {
      email: collaboratorEmail,
      role: collaboratorRole
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(() => {
      setCollaboratorEmail('');
      setCollaboratorRole('');
      handleCloseAddCollaborator();
      axios.get('http://localhost:5001/projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(response => setProjects(response.data.projects))
      .catch(error => console.error('Error fetching updated projects:', error));
    })
    .catch(error => {
      if (error.response && error.response.status === 404) {
        alert('No such user registered');
      } else {
        console.error('Error adding collaborator:', error);
      }
    });
  };

  // DELETE Project
  const handleDeleteProject = (projectId) => {
    axios.delete(`http://localhost:5001/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(() => setProjects(projects.filter((proj) => proj.id !== projectId)))
      .catch(error => console.error('Error deleting project:', error));
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <Typography variant="h4" gutterBottom>Your Projects</Typography>
      <Button variant="contained" color="primary" onClick={handleClickOpenCreate} style={{ marginBottom: '20px' }}>
        Create New Project
      </Button>

      {/* Dialog for creating a new project */}
      <Dialog open={openCreate} onClose={handleCloseCreate}>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" name="name" label="Project Name" fullWidth value={newProject.name} onChange={handleInputChange} />
          <TextField margin="dense" name="description" label="Project Description" fullWidth value={newProject.description} onChange={handleInputChange} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Select Role</InputLabel>
            <Select value={newProject.role} onChange={handleRoleChange} label="Select Role">
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
          <Button onClick={handleCloseCreate} color="secondary">Cancel</Button>
          <Button onClick={handleSubmitCreate} color="primary">Create Project</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for editing a project */}
      <Dialog open={openEdit} onClose={handleCloseEdit}>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" name="name" label="Project Name" fullWidth value={editProject.name} onChange={handleEditInputChange} />
          <TextField margin="dense" name="description" label="Project Description" fullWidth value={editProject.description} onChange={handleEditInputChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} color="secondary">Cancel</Button>
          <Button onClick={handleSubmitEdit} color="primary">Update Project</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for adding a collaborator */}
      <Dialog open={openAddCollaborator} onClose={handleCloseAddCollaborator}>
        <DialogTitle>Add Collaborator</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Collaborator Email" type="email" fullWidth value={collaboratorEmail} onChange={(e) => setCollaboratorEmail(e.target.value)} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Select Role</InputLabel>
            <Select value={collaboratorRole} onChange={(e) => setCollaboratorRole(e.target.value)} label="Select Role">
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
          <Button onClick={handleCloseAddCollaborator} color="secondary">Cancel</Button>
          <Button onClick={handleAddCollaborator} color="primary">Add Collaborator</Button>
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
  <Typography variant="body2" color="text.secondary" style={{ marginBottom: '10px' }}>
    {project.description}
  </Typography>
  
  {/* Project Details */}
  <Box>
    <Typography variant="caption" color="text.secondary" style={{ display: 'block' }}>
      <strong>Project ID:</strong> {project.id}
    </Typography>
    <Typography variant="caption" color="text.secondary" style={{ display: 'block' }}>
      <strong>Role:</strong> {project.role}
    </Typography>
    <Typography variant="caption" color="text.secondary" style={{ display: 'block' }}>
      <strong>Project Owner:</strong> {project.ownerEmail}
    </Typography>
  </Box>

  {/* Collaborators Section */}
  <Box mt={2}>
    <Typography variant="caption" color="text.secondary" style={{ display: 'block' }}>
      <strong>Collaborators:</strong>
    </Typography>
    {project.collaborators && project.collaborators.length > 0 ? (
      <Box>
        {project.collaborators
          .filter(collaborator => project.ownerEmail && collaborator.email !== project.ownerEmail)
          .map((collaborator) => (
            <Typography variant="caption" color="text.secondary" key={collaborator.email} style={{ display: 'block' }}>
              {collaborator.email} - {collaborator.role}
            </Typography>
          ))}
      </Box>
    ) : (
      <Typography variant="caption" color="text.secondary">No collaborators added yet.</Typography>
    )}
  </Box>
</CardContent>
                <CardActions>
                  <Button size="small" variant="contained" color="primary" onClick={() => handleClickOpenAddCollaborator(project)}>Add Collaborator</Button>
                  <Button size="small" variant="contained" color="secondary" onClick={() => handleClickOpenEdit(project)}>Edit</Button>
                  <Button size="small" variant="contained" color="success" onClick={() => navigate(`/projects/${project.id}/milestones`)}>Enter Project</Button>
                  <Button size="small" variant="contained" color="error" onClick={() => handleDeleteProject(project.id)}>Delete</Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
      <Button onClick={handleLogout} variant="contained" color="secondary" style={{ marginTop: '20px' }}>Logout</Button>
    </div>
  );
};

export default Project;