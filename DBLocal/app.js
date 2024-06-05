import express from "express";
import conectaBasedeDatos from "./config/ConexionDB.js";
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const PORT = 3002;
app.use(cors());
app.use(bodyParser.json());

const db = await conectaBasedeDatos();

db.on('error', (error) => {
    console.log('error en la conexión a la base de datos', error);
});

db.once('open', () => {
    console.log('conexión a la base de datos exitosa');
})

app.post('/register', async (req, res) => {
    try {
        const almacenar = 'Perfiles'; // 
        const coleccion = db.collection(almacenar);
        const cuentaMetaMask = req.body.ProfileInformation.LoginData;
        // Verificar si la cuenta de MetaMask ya existe en la base de datos
        const query = { 'ProfileInformation.LoginData': cuentaMetaMask };
        const existingUser = await coleccion.findOne(query);
        if (existingUser) {
            // Si la cuenta de MetaMask ya está registrada
            return res.status(400).json({ mensaje: 'La cuenta de MetaMask ya está registrada' });
        }
        // Guarda el documento en la colección
        await coleccion.insertOne(req.body);
        res.status(201).json({ mensaje: 'Datos almacenados exitosamente' });
        // Imprimir la cuenta de MetaMask en la consola
        console.log("Cuenta de MetaMask almacenada:", cuentaMetaMask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al almacenar los datos' });
    }
});
//método para iniciar sesión. 
app.post('/login', async (req, res) => {
    try {
        const almacenar = 'Perfiles'; // Nombre de la colección
        const coleccion = db.collection(almacenar);
        // Obtener la cuenta de MetaMask desde el cuerpo de la solicitud
        const cuentaMetaMask = req.body.ProfileInformation.LoginData;
        console.log("cuenta de metamask", cuentaMetaMask)
        // Consultar la base de datos para encontrar el documento correspondiente
        const query = { 'ProfileInformation.LoginData': cuentaMetaMask };
        const userDocument = await coleccion.findOne(query);
        if (userDocument) {
            // Extraer la información de BiometricsData
            const biometricsData = userDocument.Biometrics.BiometricsData;
            // Enviar la información de vuelta al frontend
            res.status(200).json({ biometricsData });
        } else {
            // La cuenta de MetaMask no está registrada
            res.status(404).json({ mensaje: 'Cuenta de MetaMask no registrada', cuentaMetaMask });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al procesar la solicitud' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});