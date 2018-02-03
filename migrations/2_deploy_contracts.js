var Adoption 			= artifacts.require("Adoption");
var PluckCoin			= artifacts.require("TokenFactory/PluckCoin");
var PlatoonManagement	= artifacts.require("Platoon/PlatoonManagement");

module.exports = function(deployer) {
  deployer.deploy(Adoption);
  deployer.deploy(PluckCoin);
  deployer.deploy(PlatoonManagement);
};