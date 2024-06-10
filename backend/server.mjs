import express from 'express';
import https from 'https';
import bodyParser from 'body-parser';
import { create } from 'ipfs-http-client';
import cors from 'cors';
import fs from 'fs';
import axios from 'axios';
import Web3 from 'web3';
import CryptoJS from 'crypto-js';
import UserCidRegistry from './build/contracts/UserCidRegistry.json' assert { type: 'json' };
import { generarCredencial, verificar } from './emitirCredenciales.js';

/*Establece conexión con ganache e ipfs. 
*se levanta el puerto 3000
*/
const app = express();
const PORT = 3001;
const web3 = new Web3('http://127.0.0.1:7545');
const ipfs = create({ host: '127.0.0.1', port: 5001, protocol: 'http' });
app.use(cors());
app.use(bodyParser.json());

//se verifica la conexión con ganache.
web3.eth.net.isListening()
    .then(() => console.log('Conexión exitosa con Ganache'))
    .catch(error => console.error('Error al conectar con Ganache:', error));

/*se cargan los certificados x.509 con la clave privada
*/
const options = {
    key: fs.readFileSync('./certificados/private-key.pem'),
    cert: fs.readFileSync('./certificados/cert.pem'),
};

/*
*función encargada de establecer comunicación con el contrato inteligente.
y con el ABI del contrato.
 */
const Contract = async (web3) => {
    const networkId = await web3.eth.net.getId();
    console.log("network id: ", networkId);
    const deployedNetwork = UserCidRegistry.networks[networkId];
    console.log("direccion de contrato: ", deployedNetwork.address);
    return new web3.eth.Contract(
        UserCidRegistry.abi,
        deployedNetwork && deployedNetwork.address
    );
}
//función para descifrar
const descifrar = (textoCifrado, clave) => {
    return CryptoJS.AES.decrypt(textoCifrado, clave).toString(CryptoJS.enc.Utf8);
};

//LLamado para registrar datos en el servidor.

app.post('/api/register', async (req, res) => {
    try {
        console.log("Request: ", req.body);
        console.log(typeof req.body);
        const registerData = await generarCredencial(req.body);
        console.log("credencial: ", registerData);
        const userAccount = req.body.ProfileInformation.ethereumAddress;
        console.log("Cuenta, ", userAccount);
        // Crear una instancia del contrato UserCidRegistry
        const userCidRegistryInstance = await Contract(web3);
        // Verificar si la cuenta ya está registrada
        const isRegistered = await userCidRegistryInstance.methods.isUserRegistered(userAccount).call();
        if (isRegistered) {
            return res.status(400).json({ success: false, error: 'La cuenta ya está registrada' });
        }
        // Subir los datos a IPFS
        const ipfsResponse = await ipfs.add(JSON.stringify(registerData));
        const cid = ipfsResponse.path; // Usamos .path en lugar de .cid.toString() para obtener el CID como string
        console.log("ipfsresponse es: ", ipfsResponse);
        console.log("Metamask: ", userAccount);

        // Llamar a la función storeUserCid del contrato para almacenar el CID
        await userCidRegistryInstance.methods.storeUserCid(cid).send({ from: userAccount, gas: '500000' });

        // Devolver una respuesta exitosa
        res.status(200).json({ success: true, cid });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});

//LLamado para iniciar el inicio de sesión en el servidor. 

app.post('/api/login', async (req, res) => {
    try {
        const LoginData = req.body;
        const Login = LoginData.ProfileInformation.LoginData;
        const IBV2C = LoginData.Biometrics.BiometricsData.biometricsData;
        const IBC = LoginData.Biometrics.BiometricsDataIBC;
        console.log("IBC: ", IBC);
        const userCidRegistryInstance = await Contract(web3);

        // Función para verificar que el usuario esté registrado
        const isRegistered = await userCidRegistryInstance.methods.isUserRegistered(Login).call();
        if (!isRegistered) {
            return res.status(400).json({ success: false, error: 'La cuenta no está registrada' });
        }

        const cid = await userCidRegistryInstance.methods.getUserCid(Login).call();
        console.log("CID: ", cid);

        // Conexión para recuperar información de IPFS
        try {
            const response = await axios.get(`http://127.0.0.1:8080/ipfs/${cid}`, {
                responseType: 'arraybuffer' // Para obtener los datos como buffer
            });

            const buffer = Buffer.from(response.data);
            const dataString = buffer.toString('utf-8'); // Convertir el buffer a cadena de texto
            const jsonData = JSON.parse(dataString); // Analizar la cadena como JSON

            // Verificar la credencial
            const verificacion = await verificar(jsonData);
            console.log("verificacion: ", verificacion);

            if (verificacion?.errors?.length === 0) {
                console.log("Verificación exitosa");
                console.log("datos: ", jsonData.credentialSubject.Biometrics.BiometricsData);

                const BiometricsDataCifrado = jsonData.credentialSubject.Biometrics.BiometricsData;
                const clave = jsonData.credentialSubject.KeyCliente.Clave;

                // Descifrar datos
                try {
                    const IBV1 = descifrar(BiometricsDataCifrado, clave);
                    const IBV2 = descifrar(IBV2C, clave);
                    const IBV = IBV1 + IBV2;
                    console.log("plantilla completa", IBV);

                    // Enviar datos para comparación
                    const flaskResponse = await axios.post('http://127.0.0.1:5000/compare_images', {
                        IBV,
                        IBC
                    });

                    // Procesar la respuesta de Flask
                    if (flaskResponse.data.success) {
                        console.log("funciona");
                        return res.json({ success: true, message: flaskResponse.data.message });
                    } else {
                        console.log("No reconoce");
                        return res.status(400).json({ success: false, error: flaskResponse.data.error });
                    }
                } catch (error) {
                    console.log("Ocurrió un error en el descifrado o la comparación:", error);
                    return res.status(500).json({ success: false, error: 'Error interno durante el descifrado o la comparación' });
                }
            } else {
                console.log("Verificación fallida:", verificacion.errors);
                return res.status(400).json({ success: false, error: 'Verificación de la credencial fallida' });
            }
        } catch (error) {
            console.error('Error retrieving data from local IPFS gateway:', error.message);
            return res.status(500).json({ success: false, error: 'Error interno al recuperar datos del servidor IPFS' });
        }
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});



https.createServer(options, app).listen(PORT, () => {
    console.log(`El servidor está corriendo en el puerto: ${PORT}`);
});
