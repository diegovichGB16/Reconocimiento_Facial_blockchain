import './Forms.css';
import { Header } from '../components/Header';
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import MetaMaskConnect from '../components/Metamask/MetamaskButton';
import Webcam from 'react-webcam';
import { FormControlLabel } from '@mui/material';
import { Checkbox } from '@mui/material';
import TextField from '@mui/material/TextField';
import process from '../components/procesamiento/ImageProcess';
import UAParser from 'ua-parser-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faUser } from '@fortawesome/free-solid-svg-icons';
import { Route, Routes, Link } from 'react-router-dom';
import { Dashboard } from '../Pages/Dashboard';
import { useNavigate } from 'react-router-dom'; 
import swal from 'sweetalert';
import { Helmet } from 'react-helmet';

export const Login = () => {
    const [imagen, setImagen] = useState(null);
    const [imagenrostro, setImagenRostro] = useState(null);
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [cuentaMetaMask, setCuentaMetaMask] = useState('');
    const [rostro, setRostro] = useState(false);
    const [IBV2C, setIBV2C] = useState('');
    const [IBC, setIBC] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const webcamRef = React.createRef();
    const parser = new UAParser();
    const result = parser.getResult();
    const fechaActual = new Date(); // Obtiene la fecha y hora actual
    const navigate = useNavigate();

    const handleConnectMetaMask = async () => {
        const cuentas = await MetaMaskConnect();
        if (cuentas && cuentas.length > 0) {
            const cuentaSeleccionada = cuentas[0];
            setCuentaMetaMask(cuentaSeleccionada);
            // Continúa con el registro o inicio de sesión si es necesario
        }
    };

    const capture = () => {
        if (cameraEnabled) {
            const imageSrc = webcamRef.current.getScreenshot();
            console.log(imageSrc);
            setImagen(imageSrc);
            process(imageSrc, mostrarImagenProcesada);
        } else {
            console.log("necesita activar la camara")
        }
    };

    const mostrarImagenProcesada = async (imagenProcesada) => {
        setImagenRostro(imagenProcesada);
        console.log("imagen: ", imagenProcesada);
        // Luego de que se haya establecido la imagen procesada,
        // puedes verificar si se detectó un rostro
        if (imagenProcesada != null) {
            setRostro(true);
            setIBC(imagenProcesada);
        } else {
            setRostro(false);
            console.log("hay rostro?", rostro);
        }
    };

    const solicitarDatos = async () => {
        const loginRequestDBL = {
            ProfileInformation: {
                LoginData: cuentaMetaMask,
            }
        };
        //llamado al servidor local
        try {
            //Recibo respuesta del servidor local
            const response = await fetch('http://localhost:3002/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginRequestDBL),
            });
            const dataDB = await response.json();
            setIBV2C(dataDB);
            console.log("datos recuperados", dataDB);
        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
        }

        const loginRequestBOPS = {
            ProfileInformation: {
                LoginData: cuentaMetaMask,
            },
            Biometrics: {
                BiometricsData: IBV2C,
                BiometricsDataIBC: IBC,
            }
        };
        console.log("request a bops: ", loginRequestBOPS);
        //llamado al servidor bops
        try {
            //Recibo respuesta del servidor BOPS
            const response = await fetch('https://localhost:3001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginRequestBOPS),
            });
            const data = await response.json();
            console.log("datos recuperados", data);

            if (data.success) {
                swal({
                    title: "Identidad verificada",
                    text: "Inicio de sesión correcto",
                    icon: "success"
                }).then(() => {
                    setIsAuthenticated(true); // Set the authenticated state to true
                    navigate('/Dashboard');
                });
            } else {
                swal("Error", "Inicio de sesión fallido", "error");
            }
        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
            swal("Error", "Hubo un problema con el inicio de sesión. Inténtelo de nuevo.", "error");
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setCuentaMetaMask('');
        navigate('/Home');
    };

    return (
        <>
            <Helmet><title>BiometricsChainUD: Login</title></Helmet>
            <Header isAuthenticated={isAuthenticated} metaMaskAccount={cuentaMetaMask} handleLogout={handleLogout} />
            <section className='secF'>
                <h1 className='tituloF'>Inicio de sesión</h1>
                <div id='formularioM'>
                    <div id='formularioWallet'>
                        <div className='espacio2'>
                            <Button variant="contained" onClick={handleConnectMetaMask}>
                                Conectar a MetaMask
                            </Button>
                        </div>
                        <TextField
                            id="outlined-read-only-input"
                            label="Cuenta de MetaMask"
                            value={cuentaMetaMask} // Mostrar la cuenta de MetaMask en el TextField
                            variant="outlined"
                            fullWidth
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </div>
                    <div className='Biometrico'>
                        <div className='formularioFoto'>
                            <div className='confCamara'>
                                <FormControlLabel control={<Checkbox
                                    checked={cameraEnabled} onChange={(event) => {
                                        setCameraEnabled(event.target.checked)
                                    }}
                                />} label={cameraEnabled ? 'Deshabilitar cámara' : 'Habilitar cámara'} color='success' />
                            </div>
                            <div className='espacioFoto'>
                                <div className='rostro'>
                                    {cameraEnabled ? (
                                        <Webcam
                                            audio={false}
                                            height={290}
                                            ref={webcamRef}
                                            screenshotFormat="image/jpeg"
                                            width={350}
                                            screenshotQuality={1}
                                            mirrored={true}
                                        />
                                    ) : (
                                        <p>La cámara está deshabilitada</p>
                                    )}
                                </div>
                            </div>
                            <div className='confBoton'>
                                <div className='espacioBoton'>
                                    <button className='botonCaptura' onClick={capture}>
                                        <FontAwesomeIcon icon={faCamera} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <br />
                        <div className='formularioRostro'>
                            <div className='resultado'>
                                {rostro ? (
                                    <p>Rostro detectado</p>
                                ) : (
                                    <p>Rostro NO detectado</p>
                                )}
                            </div>
                            <div className='imgContainer'>
                                <div className='img'>
                                    {rostro ? (
                                        <img src={imagenrostro} alt="" />
                                    ) : (
                                        <FontAwesomeIcon icon={faUser} className='icoprofile' />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='registro'>
                        <Button variant="contained" color="success" onClick={solicitarDatos}>
                            Iniciar sesión
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
};