import React from 'react';
import { Route, Routes } from "react-router-dom";
import { Redirigir } from "../components/Redir";
import { Home,Login,Register,Dashboard } from "../Pages/main";

export const AppRouter = () => {
  return (
  <>
    <Routes>
      <Route path="/" element={<Redirigir />}>
        <Route index element={<Home />} />
        <Route path='Home' element={<Home />} />
        <Route path='Login' element={<Login />} />
        <Route path='Register' element={<Register />} />
        <Route path='Dashboard' element={<Dashboard />} />
      </Route> 
    </Routes>
  
  </> 
  );
}
