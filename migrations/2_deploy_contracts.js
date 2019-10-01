const Meme = artifacts.require("MemeContract");
module.exports = function(deployer) {
    deployer.deploy(Meme);
  };
  