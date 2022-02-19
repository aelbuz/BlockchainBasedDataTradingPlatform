const DataRecords = artifacts.require("DataRecords");

module.exports = function(deployer) {
  deployer.deploy(DataRecords);
};
