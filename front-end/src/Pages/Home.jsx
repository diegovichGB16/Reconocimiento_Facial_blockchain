import './Home.css';
import Imagen from '../Assets/ilustracion.png';
import Logo from '../Assets/Logo.png';
import { Route, Routes, Link } from 'react-router-dom';
import {Register} from './Register';
import {Login} from './Login';
import { Helmet } from 'react-helmet';

export function Home() {
    return (
      
      <body>
        <main>
        <Helmet><title>BiometricsChainUD</title></Helmet>
            <section id="seccion1">

              <div id="logo-cointainer">
                <img src={Logo} alt='Logo' className='logo' />
              </div>

              <div id="mockup-cointainer">
                <img src={Imagen} alt='Ilustracion' className='ilustacion'/>
              </div>

            </section>

            <section id="seccion2">
              <h1>Módulo para autenticación usando datos biométricos en un entorno descentralizado</h1>
              <p>Aunque el uso de datos biométricos es más seguro, tienen el inconveniente de que si estos datos son robados pueden ser usados por terceros para acceder a nuestros datos personales o crear identidades digitales falsas, razón por la cual este proyecto sigue el estándar BOPS 2410-2017 de la IEEE, el cual da unos lineamientos para el tratamiento y almacenamiento de datos biométricos, además de usar la tecnología blockchain como registro distribuido para control y monitorización de los vectores biométricos.</p>
              {/* Navbar*/}        
              <nav className='nav'>
                <ul className='lista' >
                  <li className='button'> <Link to="/Register">Register</Link> </li>
                  <li className='button'> <Link to="/Login">Login</Link> </li>              
                </ul>         
              </nav>
              {/* Navbar*/}
            </section>
            <Routes>
              <Route path="/login" element={<Login />} />        
              <Route path="/register" element={<Register />} />    
            </Routes>          
        </main>
        </body>
    );
}

