import mongoose from 'mongoose';

async function conectaBasedeDatos() {
    mongoose.connect('mongodb://127.0.0.1:27017/Almacenamiento_local');
    return mongoose.connection;
}

export default conectaBasedeDatos;