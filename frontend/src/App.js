import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Projects from './components/Projects';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/projects" element={<Projects />} />
        {/* You can add more routes here */}
      </Routes>
    </div>
  );
}

export default App;