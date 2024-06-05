import './Forms.css'
import { Header } from '../components/Header'
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import MetaMaskConnect from '../components/Metamask/MetamaskButton';
import Webcam from 'react-webcam';
import { FormControlLabel } from '@mui/material';
import { Checkbox } from '@mui/material';
import TextField from '@mui/material/TextField';
import process from '../components/procesamiento/ImageProcess';
import UAParser from 'ua-parser-js';
import { Seed } from '../components/Cifrado/SeedOtp';
import { GenerarClave } from '../components/Cifrado/Clave';
import CryptoJS from 'crypto-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCamera, faUser } from '@fortawesome/free-solid-svg-icons'
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';



export function Register() {

    const [imagen, setImagen] = useState(null);
    const [imagenrostro, setImagenRostro] = useState(null);
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [cuentaMetaMask, setCuentaMetaMask] = useState('');
    const [rostro, setRostro] = useState(false);
    const [seedOtp, setSeedOtp] = useState('');
    const [IBV1, setIBV1] = useState('');
    const [IBV2, setIBV2] = useState('');
    const [IBV1C, setIBV1C] = useState('');
    const [IBV2C, setIBV2C] = useState('');
    const [KeyC, setKeyC] = useState('');
    const [iv, setIv] = useState('');
    const [shouldRegister, setShouldRegister] = useState(false);
    const webcamRef = React.createRef();
    const parser = new UAParser();
    const result = parser.getResult();
    const fechaActual = new Date(); // Obtiene la fecha y hora actual
    const navigate = useNavigate();
    //recoger cuenta de metamask
    const handleConnectMetaMask = async () => {
        const cuentas = await MetaMaskConnect();
        if (cuentas && cuentas.length > 0) {
            const cuentaSeleccionada = cuentas[0];
            setCuentaMetaMask(cuentaSeleccionada);
            // Continúa con el registro o inicio de sesión si es necesario
        }
    };
    //capturar imagen del rostro
    const capture = () => {
        if (cameraEnabled) {
            const imageSrc = webcamRef.current.getScreenshot();
            console.log("imagen capturada", imageSrc);
            setImagen(imageSrc);
            process(imageSrc, mostrarImagenProcesada);
        } else {
            console.log("necesita activar la camara")
        }
    };
    //Mostrar imagen procesada
    const mostrarImagenProcesada = async (imagenProcesada) => {
        setImagenRostro(imagenProcesada);
        const seed = await Seed();
        setSeedOtp(seed); //obtener semilla para cifrado;
        console.log("imagen procesada: ", imagenProcesada);
        dividirIBV(imagenProcesada);
        if (imagenProcesada != null) {
            setRostro(true);
        } else {
            setRostro(false);
        }
    };
    //Dividir plantilla biométrica
    const dividirIBV = async (IBV) => {
        console.log("el tamaño de la imagen es: ", IBV.length);
        setIBV1(IBV.slice(0, IBV.length / 2));
        setIBV2(IBV.slice(IBV.length / 2, IBV.length));
    };
    //Mostrar tamaño las dos partes de la plantilla y semilla de otp
    useEffect(() => {
        setIv(CryptoJS.lib.WordArray.random(16));
        setKeyC(GenerarClave(16));
        console.log("parte1", IBV1);
        console.log("parte2", IBV2);
        console.log('seed: ', seedOtp);
        console.log("hay rostro: ", rostro);
    }, [IBV1, IBV2, seedOtp])
    //Función para cifrar junto con llave de cifrado
    const cifrar = (data, key, iv) => {
        if (typeof data !== 'string') {
            data = JSON.stringify(data);
        }
        console.log("data: ", data);
        console.log("key ", key);
        console.log("iv: ", iv);
        const datosCifrados = CryptoJS.AES.encrypt(data, key, { iv }).toString();
        console.log("cifrado: ", datosCifrados);
        // Devolver los datos cifrados
        return datosCifrados;
    };
    //mostrar llave de cifrado y las dos mitades cifradas
    useEffect(() => {
        console.log("clave de cifrado: ", KeyC);
        console.log("IBV1 cifrado: ", IBV1C);
        console.log("IBV2 cifrado: ", IBV2C);
    }, [IBV1C, IBV2C, KeyC])

    //Función para realizar llamado de almacenamiento local
    const handleRegisterClient = async () => {
        const registerRequest = {
            ProfileInformation: {
                RegistrationMode: 'Rostro',
                LoginData: cuentaMetaMask,
                Biometrics: 'reconocimiento facial',
            },
            Biometrics: {
                type: "rostro",
                version: "1.0",
                format: "Base64",
                BiometricsData: IBV2C,
            },
            ts: fechaActual,
        }
        console.log("Register del cliente.", registerRequest);

        try {
            // Recibo respuesta del servidor 
            const response = await fetch('http://localhost:3002/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerRequest),
            });
            const data = await response.json();
            console.log("respuesta del almacenamiento local", data);

            return data; // Devolver datos para manejar después
        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
            throw error; // Lanzar el error para manejar después
        }
    }

    //Solicitud al servidor BOPS para almacenamiento
    const handleRegisterBOPS = async () => {
        const registerRequest = {
            DeviceInformation: {
                os: result.os,
                seedOtp: seedOtp,
            },
            ProfileInformation: {
                RegistrationMode: 'Rostro',
                ethereumAddress: cuentaMetaMask,
                Biometrics: 'reconocimiento facial',
            },
            Biometrics: {
                type: "rostro",
                version: "1.0",
                format: "base64",
                BiometricsData: IBV1C,
            },
            KeyCliente: {
                Clave: KeyC,
            },
            ts: fechaActual,
        }
        console.log("Register de bops", registerRequest);

        try {
            const response = await fetch('https://localhost:3001/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerRequest),
            });

            const data = await response.json();
            console.log("respuesta del servidor", data);

            return data; // Devolver datos para manejar después
        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
            throw error; // Lanzar el error para manejar después
        }
    }

    const almacenar = async () => {
        try {
            if (IBV1 && IBV2) {
                setIBV1C(cifrar(IBV1, KeyC, iv));
                console.log("iv: ", iv);
                setIBV2C(cifrar(IBV2, KeyC, iv));
                console.log("setShouldRegister: ", setShouldRegister);
                setShouldRegister(true);
            } else {
                console.error('IBV1 o IBV2 son undefined.');
                return; // Salir de la función si IBV1 o IBV2 son undefined
            }
        } catch (error) {
            console.error('Error al cifrar y almacenar los datos:', error);
        }
    }

    useEffect(() => {
        if (shouldRegister) {
            (async () => {
                try {
                    await handleRegisterBOPS();
                    await handleRegisterClient();
                    swal({
                        title: "Registro exitoso",
                        text: "Su registro ha sido completado con éxito",
                        icon: "success"
                    }).then(() => {
                        navigate('/'); // Redirigir a la página de inicio
                    });
                } catch (error) {
                    console.error('Error durante el registro:', error);
                    swal("Error de registro", "Hubo un problema con el registro. Inténtelo de nuevo.", "error");
                } finally {
                    setShouldRegister(false);
                }
            })();
        }
    }, [IBV1C, IBV2C, KeyC, shouldRegister]);


    return (
        <>
            <Helmet><title>BiometricsChainUD: Register</title></Helmet>
            <Header />
            <section className='secF'>
                <h1 className='tituloF'>Registrar datos</h1>
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
                                    }
                                    }
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
                        <Button variant="contained" color="success" onClick={almacenar}>
                            Registrar datos
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}