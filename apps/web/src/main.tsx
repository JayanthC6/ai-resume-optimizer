import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './index.css';

// Apply saved theme BEFORE first render to prevent flash
const saved = localStorage.getItem('hiredlens-theme') ?? 'system';
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const isDark = saved === 'dark' || (saved === 'system' && prefersDark);
document.documentElement.classList.toggle('dark', isDark);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
