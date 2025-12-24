import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// SOLUCIÓN: Un solo BrowserRouter envuelve TODO
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Si quieres quitar StrictMode temporalmente:
// root.render(
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>
// );