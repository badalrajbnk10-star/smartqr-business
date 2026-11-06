import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// One-time clean reset for fresh launch
try {
  if (!localStorage.getItem('smartqr_clean_launch_v1')) {
    localStorage.clear();
    localStorage.setItem('smartqr_clean_launch_v1', 'true');
  }
} catch {}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
