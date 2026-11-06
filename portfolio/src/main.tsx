import React from 'react';
import ReactDOM from 'react-dom/client';
import Modal from 'react-modal';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { routerFuture } from './routerFuture';
import './styles/index.css';
import './styles/App.css';
import './styles/pages.css';

// Lets react-modal hide the rest of the page from screen readers while open.
Modal.setAppElement('#root');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={routerFuture}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
