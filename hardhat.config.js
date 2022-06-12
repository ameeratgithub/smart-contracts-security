require('dotenv').config()

require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("solidity-coverage")

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.6.0"
      },
      {
        version: "0.8.9"
      },
    ]
  },
  networks: {
    hardhat: {
      initialBaseFeePerGas: 0,
      blockGasLimit: 20000000
    }
  },
  gasReporter: {
    enabled: true,
    currency: 'USD'
  },
  mocha: {
    timeout: 4000000
  }
};
