import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";


ReactDOM.createRoot(document.getElementById('root')).render(  
  <React.StrictMode>
    <BrowserRouter>
      <App />
      {/*<div className="background-image"></div>*/}
    </BrowserRouter>
  </React.StrictMode>
);


