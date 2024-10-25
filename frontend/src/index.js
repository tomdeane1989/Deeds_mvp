import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Your main App component
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter> {/* You only need this here */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);