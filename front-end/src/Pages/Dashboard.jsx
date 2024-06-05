import './Dashboard.css'
import React from 'react'
import { Helmet } from 'react-helmet';
import Recognition from '../Assets/bioRecognition.png'
import { Header } from '../components/Header'


export const Dashboard = () => {
  return (
    <>     
      <Helmet><title>BiometricsChainUD: Dashboard</title></Helmet>
      <Header />
      
      <div className='content'>
        <div className='secTitulo'>
          <h1 className='Titu'>BIENVENIDO</h1>
        </div>
        <div className='secRecog'>
          <img src={Recognition} alt='bioRecognition' className='Recognition' />
        </div>
      </div>
    </>    
  )
}
