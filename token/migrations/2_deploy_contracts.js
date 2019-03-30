var FalconsToken = artifacts.require("./FalconsToken.sol");
var FalconsTokenSale = artifacts.require("./FalconsTokenSale.sol");

module.exports = function (deployer) {
  deployer.deploy(FalconsToken, 1000000).then(function () {
    //MAking the Token price to be 0.002 Ether
    var tokenPrice = 2000000000000000;
    return deployer.deploy(FalconsTokenSale, FalconsToken.address, tokenPrice);
  });
};
