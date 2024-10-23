const jwt = require('jsonwebtoken');

// Middleware to check if the user has the required role and permission for a specific milestone
const checkTaskPermissions = (action, milestoneTitle) => {
  return (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
      return res.status(403).json({ message: 'No token provided' });
    }

    const tokenPart = token.split(' ')[1];

    jwt.verify(tokenPart, 'your_jwt_secret', (err, decoded) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to authenticate token' });
      }

      const { role } = decoded;

      // Define permissions based on the matrix
      const permissionsMatrix = {
        'Offer Stage': {
          admin: ['read', 'create', 'edit'],
          buyer: ['read', 'create', 'edit'],
          seller: [],
          agent: [],
          solicitor: [],
          mortgage_advisor: ['read'],
        },
        'Offer Accepted': {
          admin: ['read', 'create', 'edit'],
          buyer: ['read', 'create', 'edit'],
          seller: [],
          agent: [],
          solicitor: [],
          mortgage_advisor: ['read'],
        },
        'Solicitor/Conveyancer Admin': {
          admin: ['read', 'create', 'edit'],
          buyer: ['read', 'create', 'edit'],
          seller: [],
          agent: [],
          solicitor: ['read', 'create', 'edit'],
          mortgage_advisor: [],
        },
        'Mortgage Application': {
          admin: ['read', 'create', 'edit'],
          buyer: ['read', 'create', 'edit'],
          seller: [],
          agent: ['read', 'create', 'edit'],
          solicitor: ['read', 'create'],
          mortgage_advisor: ['read', 'create', 'edit'],
        },
        'Contract Exchange': {
          admin: ['read', 'create', 'edit'],
          buyer: ['read', 'create', 'edit'],
          seller: ['read', 'create'],
          agent: ['read'],
          solicitor: ['read', 'create', 'edit'],
          mortgage_advisor: ['read'],
        },
        'Key Exchange': {
          admin: ['read', 'create', 'edit'],
          buyer: ['read', 'create', 'edit'],
          seller: ['read', 'create'],
          agent: ['read'],
          solicitor: ['read', 'create', 'edit'],
          mortgage_advisor: ['read'],
        },
      };

      const allowedActions = permissionsMatrix[milestoneTitle][role] || [];

      if (!allowedActions.includes(action)) {
        return res.status(403).json({ message: `Access denied. You do not have permission to ${action} tasks for the ${milestoneTitle} milestone.` });
      }

      req.user = decoded; // Add user data to the request object
      next(); // Proceed to the next middleware or route
    });
  };
};

module.exports = checkTaskPermissions;