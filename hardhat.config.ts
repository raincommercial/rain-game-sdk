import * as dotenv from 'dotenv';
import { task } from 'hardhat/config';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import '@typechain/hardhat';

dotenv.config();
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (args, hre) => {
  console.log(args);
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});

function createLocalHostConfig() {
  const url = 'http://localhost:8545';
  const mnemonic =
    'test test test test test test test test test test test junk';
  return {
    accounts: {
      count: 10,
      initialIndex: 0,
      mnemonic,
      path: "m/44'/60'/0'/0",
    },
    url,
    blockGasLimit: 30000000,
    allowUnlimitedContractSize: true,
  };
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  typechain: {
    outDir: 'typechain',
  },
  solidity: {
    compilers: [
      {
        version: '0.8.10',
        settings: {
          optimizer: {
            enabled: true,
            runs: 100000,
          },
          metadata: {
            useLiteralContent: true,
          },
        },
      },
    ],
  },
  defaultNetwork: 'hardhat',
  networks: {
    localhost: createLocalHostConfig(),
    hardhat: {
      blockGasLimit: 30000000,
      allowUnlimitedContractSize: true,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${process.env.API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
