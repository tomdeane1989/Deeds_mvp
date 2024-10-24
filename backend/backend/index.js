const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Project, Milestone } = require('./models'); // Include models
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

// Create Project Route
app.post('/projects', verifyToken, async (req, res) => {
  const { name, description } = req.body;
  try {
    const project = await Project.create({ name, description });

    // Associate the project with the current user
    const user = await User.findByPk(req.user.id);
    await user.addProject(project); // This adds the association in UserProjects

    res.json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating project', error });
  }
});

// Update Project Route (PUT)
app.put('/projects/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if the current user is associated with the project
    const user = await User.findByPk(req.user.id, {
      include: {
        model: Project,
        where: { id },
        through: { attributes: [] }
      }
    });

    if (!user || !user.Projects.length) {
      return res.status(403).json({ message: 'You are not authorized to update this project.' });
    }

    // Update project
    project.name = name;
    project.description = description;

    await project.save();

    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Error updating project', error });
  }
});

// Milestones POST route
app.post('/milestones', verifyToken, async (req, res) => {
  const milestones = req.body;

  try {
    const createdMilestones = await Milestone.bulkCreate(milestones);
    res.json({ message: 'Milestones created successfully', createdMilestones });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating milestones', error });
  }
});

// GET Projects
app.get('/projects', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: {
        model: Project,
        through: {
          attributes: [] // This avoids returning UserProjects metadata
        }
      }
    });
    const projects = user ? user.Projects : [];
    res.json({ projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching projects', error });
  }
});

// Milestones GET Route
app.get('/milestones', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.query;

    const user = await User.findByPk(req.user.id, {
      include: {
        model: Project,
        attributes: ['id'],
        through: { attributes: [] }
      }
    });

    if (!user || !user.Projects.length) {
      return res.status(404).json({ message: 'No projects found for this user.' });
    }

    const selectedProjectId = projectId || user.Projects[0].id;

    const milestones = await Milestone.findAll({ where: { projectId: selectedProjectId } });

    if (!milestones.length) {
      return res.status(404).json({ message: 'No milestones found for this project.' });
    }

    res.json({ milestones });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching milestones', error });
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