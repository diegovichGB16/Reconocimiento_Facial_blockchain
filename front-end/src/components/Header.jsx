import './Header.css';
import React from "react";
import { useState } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import { Home } from '../Pages/Home';
import { Register } from '../Pages/Register';
import { Login } from '../Pages/Login';
import Icono from '../Assets/Logo.png';
import Menu from '../Assets/menu.png';

export const Header = ({ isAuthenticated, metaMaskAccount, handleLogout }) => {
  const [menuClicked, setMenuClicked] = useState(false)

  const handleClick = () => {
    setMenuClicked(prevState=>!prevState)
  }

  return(
      <header >    
        <Link to ="/Home"> <img src={Icono} className='icono' alt='Icono' /> </Link> 
          <nav className='navegador'>
            <ul className='list' style={{ display: menuClicked ? 'flex' : '' }}>
              <li> <Link to="/Home">Home</Link> </li>
              {isAuthenticated ? (
                <>
                  <li><span className='username'>{metaMaskAccount}</span></li>
                  <li><button className='btn-logout' onClick={handleLogout}>Cerrar sesión</button></li>
                </>
              ) : (
                <>
                  <li><Link to="/Login">Login</Link></li>
                  <li className='especialist'><Link to="/Register">Register</Link></li>
                </>
              )}
            </ul>
            <div className='burgermenu' onClick={handleClick}> 
              <img src={Menu} className="Burger" alt="" />
            </div>
          </nav>
  
      <Routes>
        <Route path="/Home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </header>
    )
}