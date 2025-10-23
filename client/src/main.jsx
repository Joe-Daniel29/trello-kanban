import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <-- Import the Router here
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap the entire App in the Router here */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

