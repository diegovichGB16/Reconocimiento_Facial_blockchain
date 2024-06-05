import Web3 from 'web3';

const MetaMaskConnect = async () => {
    if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.enable();
            const accounts = await web3.eth.getAccounts();
            console.log('Cuentas de MetaMask:', accounts);

            return accounts; // Puedes devolver las cuentas u otra información si es necesario
        } catch (error) {
            console.error('Error al conectar con MetaMask:', error);
            return null; // Manejo de errores
        }
    } else {
        console.error('MetaMask no está instalado o no se encuentra activo.');
        return null; // Manejo de casos donde MetaMask no está disponible
    }
};

export default MetaMaskConnect;
