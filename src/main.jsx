import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Order matters: Tailwind first, then your original stylesheet — this is the
// exact cascade the CDN build produced, so nothing visual changes.
import './styles/tailwind.css';
import './styles/custom.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
