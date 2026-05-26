import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
const savedTheme = localStorage.getItem('wtp-theme');
if (savedTheme) { document.documentElement.style.setProperty('--primary-color', savedTheme); document.documentElement.style.setProperty('--primary-hover', savedTheme); }
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
