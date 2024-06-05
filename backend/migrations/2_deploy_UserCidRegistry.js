const UserCidRegistry = artifacts.require("UserCidRegistry");

module.exports = function (deployer) {
    deployer.deploy(UserCidRegistry);
};
