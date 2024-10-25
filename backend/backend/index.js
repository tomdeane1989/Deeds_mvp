const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Project, Milestone, UserProjectRole, UserProjects } = require('./models');
const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000', // The frontend URL
    credentials: true, // Allow cookies to be sent
}));

// JWT Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }
  const tokenPart = token.split(' ')[1];
  jwt.verify(tokenPart, 'your_jwt_secret', (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to authenticate token' });
    }
    req.user = decoded;
    next();
  });
};

// Register Route
app.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  
  if (role !== 'Private' && role !== 'Professional') {
    return res.status(400).json({ message: 'Invalid role. Must be Private or Professional.' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword, role });
    res.json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

////////////////////////////Start of ALL PROJECT Routes/////////////////

// Create Project Route
app.post('/projects', verifyToken, async (req, res) => {
  const { name, description, userRole } = req.body;

  try {
    // Create the project
    const project = await Project.create({
      name,
      description,
      ownerId: req.user.id // Assign the authenticated user as the owner
    });

    // Add user as the project owner with the specified role or default to Admin
    await UserProjectRole.create({
      userId: req.user.id,
      projectId: project.id,
      role: userRole || 'Admin' // Default role as Admin if none provided
    });

    // Define standard milestones for buyers and sellers
    const buyerMilestones = [
      { title: 'Viewings', description: 'Initial property viewings', projectId: project.id },
      { title: 'Offer Stage', description: 'Initial offer stage', projectId: project.id },
      { title: 'Offer Accepted', description: 'Offer accepted stage', projectId: project.id },
      { title: 'Solicitor/Conveyancer Admin', description: 'Legal admin process', projectId: project.id },
      { title: 'Mortgage Application', description: 'Applying for mortgage', projectId: project.id },
      { title: 'Contract Exchange', description: 'Contract exchange phase', projectId: project.id },
      { title: 'Key Exchange', description: 'Final stage with key exchange', projectId: project.id }
    ];

    const sellerMilestones = [
      { title: 'Viewings', description: 'Initial property viewings', projectId: project.id },
      { title: 'Offer Stage', description: 'Initial offer stage for property sale', projectId: project.id },
      { title: 'Offer Accepted', description: 'Offer accepted stage for sale', projectId: project.id },
      { title: 'Solicitor/Conveyancer Admin', description: 'Legal and conveyancing admin process', projectId: project.id },
      { title: 'Survey and Valuation', description: 'Property survey and valuation', projectId: project.id },
      { title: 'Contract Exchange', description: 'Contract exchange phase', projectId: project.id },
      { title: 'Completion', description: 'Completion of sale and transfer of ownership', projectId: project.id }
    ];

    // Select appropriate milestones based on the userRole
    const milestonesToCreate = userRole === 'Buyer' ? buyerMilestones : sellerMilestones;

    // Bulk create milestones for the project
    await Milestone.bulkCreate(milestonesToCreate);

    // Respond with project creation success and project data
    res.json({ message: 'Project and default milestones created successfully', project });
  } catch (error) {
    console.error('Error creating project and milestones:', error);
    res.status(500).json({ message: 'Error creating project and milestones', error });
  }
});

// Update Project Route (PUT)
app.put('/projects/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, description, userRole } = req.body;

  try {
    // Find the project by its ID
    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if the current user is associated with the project using correct alias for collaborations
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Project,
          as: 'collaborations', // Use the correct alias
          where: { id }, // Ensure we're only looking for the correct project
          through: { attributes: [] }, // Remove unnecessary attributes from join table
        }
      ]
    });

    if (!user || !user.collaborations.length) {
      return res.status(403).json({ message: 'You are not authorized to update this project.' });
    }

    // Update project details
    project.name = name;
    project.description = description;

    await project.save();

    // If the userRole is provided, update or create the role in UserProjectRole
    if (userRole) {
      const userProjectRole = await UserProjectRole.findOne({ where: { userId: user.id, projectId: id } });
      if (userProjectRole) {
        userProjectRole.role = userRole;
        await userProjectRole.save();
      } else {
        await UserProjectRole.create({ userId: user.id, projectId: id, role: userRole });
      }
    }

    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Error updating project', error });
  }
});

// DELETE Project Route
app.delete('/projects/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Use the correct alias for the Project association with User
    const user = await User.findByPk(req.user.id, {
      include: {
        model: Project,
        as: 'collaborations', // Use the correct alias
        where: { id },
        through: { attributes: [] }
      }
    });

    if (!user || !user.collaborations.length) { // Adjusted to use the alias here as well
      return res.status(403).json({ message: 'You are not authorized to delete this project.' });
    }

    await UserProjects.destroy({ where: { projectId: id } });
    await Milestone.destroy({ where: { projectId: id } });
    await project.destroy();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project', error });
  }
});

// GET Projects - Return project-specific roles, owner email, and collaborators
app.get('/projects', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Project,
          as: 'collaborations', // Correct alias from your association
          through: { attributes: [] }, // Join table attributes are not needed here
          include: [
            { model: User, as: 'owner', attributes: ['email'] }, // Alias for the owner association
            {
              model: User,
              as: 'collaborators', // Alias for the collaborators association
              through: { model: UserProjectRole, attributes: ['role'] }, // Reference UserProjectRole
              attributes: ['email']
            }
          ]
        }
      ]
    });

    const projects = user ? user.collaborations : [];

    // Fetch user roles for each project
    const projectRoles = await UserProjectRole.findAll({
      where: { userId: req.user.id }
    });

    const projectsWithDetails = projects.map(project => {
      const projectRole = projectRoles.find(role => role.projectId === project.id);

      // Get collaborators and their roles
      const collaborators = project.collaborators.map(collaborator => ({
        email: collaborator.email,
        role: collaborator.UserProjectRole ? collaborator.UserProjectRole.role : 'No role assigned'
      }));

      return {
        ...project.toJSON(),
        role: projectRole ? projectRole.role : 'No role assigned',
        ownerEmail: project.owner ? project.owner.email : 'No owner',
        collaborators // Include the list of collaborators
      };
    });

    res.json({ projects: projectsWithDetails });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects', error });
  }
});


// GET single project by ID
app.get('/projects/:projectId', verifyToken, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const project = await Project.findByPk(projectId, {
      include: [
        { model: User, as: 'owner', attributes: ['email'] },
        {
          model: User,
          as: 'collaborators',
          through: { model: UserProjectRole, attributes: ['role'] },
          attributes: ['email']
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Error fetching project', error });
  }
});


// Add Collaborator Route
app.post('/projects/:id/add-collaborator', verifyToken, async (req, res) => {
  const { id } = req.params;  // Project ID
  const { email, role } = req.body;  // Collaborator email and role

  try {
    const project = await Project.findByPk(id);
    if (!project || project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to add collaborators to this project.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Cannot add users that are not in the system!' });  // Updated message
    }

    await UserProjectRole.create({
      userId: user.id,
      projectId: id,
      role
    });

    res.json({ message: 'Collaborator added successfully' });
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({ message: 'Error adding collaborator', error });
  }
});

// Get Project Collaborators
app.get('/projects/:id/collaborators', verifyToken, async (req, res) => {
  const { id } = req.params;  // Project ID

  try {
    const collaborators = await User.findAll({
      include: {
        model: UserProjectRole,
        where: { projectId: id },
        attributes: ['role']
      }
    });

    res.json({ collaborators });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    res.status(500).json({ message: 'Error fetching collaborators', error });
  }
});


///////////////////// Start of ALL MILESTONES CODE /////////////////////


// Get Milestones by Project ID
app.get('/projects/:projectId/milestones', verifyToken, async (req, res) => {
  const { projectId } = req.params;
  try {
    const milestones = await Milestone.findAll({ where: { projectId } });
    if (!milestones) return res.status(404).json({ message: 'No milestones found' });
    res.json({ milestones });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ message: 'Error fetching milestones', error });
  }
});

// Create a Milestone for a Project
app.post('/projects/:projectId/milestones', verifyToken, async (req, res) => {
  const { projectId } = req.params;
  const { title, description, dueDate } = req.body; // Include dueDate if needed

  if (!title) {
    return res.status(400).json({ message: 'Title is required for the milestone' });
  }

  try {
    // Check if the project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Create the new milestone associated with the project
    const milestone = await Milestone.create({
      title,
      description,
      dueDate, // Only include if present in the request body
      projectId
    });

    res.json({ message: 'Milestone created successfully', milestone });
  } catch (error) {
    console.error('Error creating milestone:', error);
    res.status(500).json({ message: 'Error creating milestone', error });
  }
});

// Verify Token Route
app.get('/verify-token', verifyToken, (req, res) => {
  res.json({ valid: true, message: 'Token is valid' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});