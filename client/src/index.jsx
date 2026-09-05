import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// index.js — the entry point of the React application
// ReactDOM.createRoot mounts our App component into the <div id="root"> in public/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // StrictMode helps catch potential problems during development
  // It runs certain checks and warnings only in development mode, not in production
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
