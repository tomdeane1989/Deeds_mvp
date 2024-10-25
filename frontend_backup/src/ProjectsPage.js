import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/projects', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProjects(response.data.projects);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleCreateProject = () => {
    navigate('/create-project');
  };

  if (loading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div>
      <h2>Your Projects</h2>
      {projects.length === 0 ? (
        <div>
          <p>No projects found. You can create a new project.</p>
          <button onClick={handleCreateProject}>Create Project</button>
        </div>
      ) : (
        <div>
          <ul>
            {projects.map((project) => (
              <li key={project.id}>{project.name}</li>
            ))}
          </ul>
          <button onClick={handleCreateProject}>Create New Project</button>
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;