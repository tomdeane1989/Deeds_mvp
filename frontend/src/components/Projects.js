import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/projects", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.projects) {
          setProjects(data.projects);
        }
      })
      .catch((error) => console.error("Error fetching projects:", error));
  }, []);

  const createProject = () => {
    fetch("/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ name: newProjectName }),
    })
      .then((response) => response.json())
      .then((data) => {
        setProjects([...projects, data.project]);
        setNewProjectName("");
      })
      .catch((error) => console.error("Error creating project:", error));
  };

  const handleSelectProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div>
      <h2>Your Projects</h2>
      {projects.length > 0 ? (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              {project.name}{" "}
              <button onClick={() => handleSelectProject(project.id)}>
                Select
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div>
          <p>No projects found. Create a new project below:</p>
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Project Name"
          />
          <button onClick={createProject}>Create Project</button>
        </div>
      )}
    </div>
  );
};

export default Projects;