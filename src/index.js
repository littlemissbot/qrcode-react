import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const rootElement = document.getElementById('root');
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// The build step prerenders every route to static HTML (see scripts/prerender.mjs)
// and stamps the path it rendered on #root. Hydrate only when the markup matches
// the current URL; otherwise (e.g. the SPA fallback serving index.html for an
// unknown path) render from scratch to avoid hydration mismatches.
if (rootElement.dataset.prerendered === window.location.pathname) {
  ReactDOM.hydrate(app, rootElement);
} else {
  rootElement.innerHTML = '';
  ReactDOM.render(app, rootElement);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
