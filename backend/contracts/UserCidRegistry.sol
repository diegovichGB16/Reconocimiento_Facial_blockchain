// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserCidRegistry {
    // Estructura para almacenar la dirección de usuario y el CID
    struct UserCid {
        address user;
        string cid;
    }
    // Array para almacenar todos los UserCid
    UserCid[] public userCids;

    // Mapping para verificar si una dirección ya ha sido registrada
    mapping(address => bool) private registeredUsers;

    // Mapping para almacenar el CID asociado a una dirección
    mapping(address => string) private userCidMapping;

    // Evento para notificar cuando se almacena un nuevo UserCid
    event UserCidStored(address indexed user, string cid);

    // Función para almacenar un nuevo UserCid
    function storeUserCid(string memory _cid) public {
        require(!registeredUsers[msg.sender], "User already registered");

        userCids.push(UserCid(msg.sender, _cid));
        registeredUsers[msg.sender] = true;
        userCidMapping[msg.sender] = _cid;

        emit UserCidStored(msg.sender, _cid);
    }

    // Función para obtener el número total de UserCid almacenados
    function getUserCidCount() public view returns (uint256) {
        return userCids.length;
    }

    // Función para obtener un UserCid por índice
    function getUserCidByIndex(
        uint256 index
    ) public view returns (address, string memory) {
        require(index < userCids.length, "Index out of bounds");
        UserCid memory userCid = userCids[index];
        return (userCid.user, userCid.cid);
    }

    // Función para verificar si una dirección ya ha sido registrada
    function isUserRegistered(address user) public view returns (bool) {
        return registeredUsers[user];
    }

    // Función para obtener el CID asociado a una dirección
    function getUserCid(address user) public view returns (string memory) {
        require(isUserRegistered(user), "User not registered");
        return userCidMapping[user];
    }
}
