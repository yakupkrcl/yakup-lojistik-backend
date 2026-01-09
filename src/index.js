// src/index.js (DÜZELTİLMİŞ)

import React from 'react';
import ReactDOM from 'react-dom/client';
// 👈 Çözüm: BrowserRouter'ı import edin!
import { BrowserRouter } from 'react-router-dom'; 

import App from './App';
import { AuthProvider } from './context/AuthContext';
// import './index.css'; // Global CSS dosyaları

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);