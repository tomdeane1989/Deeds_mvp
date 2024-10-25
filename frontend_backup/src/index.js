import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App'; // Assuming App is your main component

// Creating the root
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app inside the BrowserRouter for routing
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);