import './App.css';
import React from "react";
//import { Register } from './components/register/Register';
import { loadHaarFaceModels } from './components/UtilsCv/haarFaceDetection';
//import { Login } from './components/Login/Login';
//import { Home } from './components/home/Home';
//import { Header } from './components/Header/Header';
//import Mobile from './Assets/Mobile.jpg';
//import Web from './Assets/Web.jpg';
//import Fondo from './Assets/Fondo.jpg';
import { Helmet } from 'react-helmet';

import { AppRouter } from "./router/AppRouter";

function App() {
  loadHaarFaceModels();
  return (
    <>
    <AppRouter />
          <main>
          <Helmet><title>BiometricsChainUD</title></Helmet>
            {/*
          <picture>       
            <source media='(max-width:640px)' srcSet={Mobile}/>
            <source media='(min-width:641px)' srcSet={Web}/>         
            <img src={Mobile} alt="backgroung" />
          </picture>
           */}
      </main>
    </>
  );
}

export default App;