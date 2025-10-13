import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Ensure light theme is consistently applied
document.documentElement.classList.remove('dark');
document.documentElement.classList.add('light');
localStorage.removeItem('theme');
localStorage.removeItem('darkMode');

// Set meta theme color
const metaThemeColor = document.querySelector('meta[name="theme-color"]');
if (metaThemeColor) {
  metaThemeColor.setAttribute('content', '#ffffff');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  // Temporarily disabling StrictMode for debugging
  // <React.StrictMode>
    <App />
  // </React.StrictMode>,
);
