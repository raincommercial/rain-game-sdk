import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { it } from 'mocha';
import type { Rain1155, Rain1155ConfigStruct } from '../typechain/Rain1155';
import type { Token } from '../typechain/Token';
import type { ReserveToken } from '../typechain/ReserveToken';
import type { ReserveTokenERC1155 } from '../typechain/ReserveTokenERC1155';
import type { ReserveTokenERC721 } from '../typechain/ReserveTokenERC721';
import { Rain1155 as Rain1155SDK, AssetConfig } from '../dist';

import { eighteenZeros, fetchFile, writeFile } from './utils';
import path from 'path';
import { AllStandardOpsStateBuilder } from '../typechain';
import { RainJS, StateConfig, VM } from 'rain-sdk';
import { conditionObject, ConditionType, OperatorType, price, RuleType } from '../src/classes/rulesGenerator';
import { concat, op } from '../src/utils';
import { BigNumber } from 'ethers';

export let rain1155: Rain1155;
export let rain1155Config: Rain1155ConfigStruct;

export let stateBuilder: AllStandardOpsStateBuilder;

export let rain1155SDK: Rain1155SDK;

export let USDT: ReserveToken;

export let BNB: Token;
export let SOL: Token;
export let XRP: Token;
export let rTKN: Token;
export let BAYC: ReserveTokenERC721;

export let CARS: ReserveTokenERC1155;
export let PLANES: ReserveTokenERC1155;
export let SHIPS: ReserveTokenERC1155;

export let owner: SignerWithAddress,
  creator: SignerWithAddress,
  creator2: SignerWithAddress,
  buyer1: SignerWithAddress,
  buyer2: SignerWithAddress,
  buyer3: SignerWithAddress,
  buyer4: SignerWithAddress,
  buyer5: SignerWithAddress,
  buyer6: SignerWithAddress,
  gameAsstesOwner: SignerWithAddress,
  admin: SignerWithAddress;

export let prices: price[];



before('Deploy Rain1155 Contract and subgraph', async function () {
  const signers = await ethers.getSigners();
  owner = signers[0];
  creator = signers[1];
  creator2 = signers[2];
  buyer1 = signers[3];
  buyer2 = signers[4];
  buyer3 = signers[5];
  buyer4 = signers[6];
  buyer5 = signers[7];
  buyer6 = signers[8];
  gameAsstesOwner = signers[9];
  admin = signers[10];

  const stateBuilderFactory = await ethers.getContractFactory(
    'AllStandardOpsStateBuilder'
  );
  stateBuilder =
    (await stateBuilderFactory.deploy()) as AllStandardOpsStateBuilder;
  await stateBuilder.deployed();

  let Rain1155 = await ethers.getContractFactory('Rain1155');

  rain1155Config = {
    vmStateBuilder: stateBuilder.address,
  };

  rain1155 = (await Rain1155.deploy(rain1155Config)) as Rain1155;

  await rain1155.deployed();

  rain1155SDK = new Rain1155SDK(rain1155.address, owner);

  const Erc20 = await ethers.getContractFactory('Token');
  const stableCoins = await ethers.getContractFactory('ReserveToken');
  const Erc721 = await ethers.getContractFactory('ReserveTokenERC721');
  const Erc1155 = await ethers.getContractFactory('ReserveTokenERC1155');

  USDT = (await stableCoins.deploy()) as ReserveToken;
  await USDT.deployed();
  BNB = (await Erc20.deploy('Binance', 'BNB')) as Token;
  await BNB.deployed();
  SOL = (await Erc20.deploy('Solana', 'SOL')) as Token;
  await SOL.deployed();
  XRP = (await Erc20.deploy('Ripple', 'XRP')) as Token;
  await XRP.deployed();

  BAYC = (await Erc721.deploy(
    'Boared Ape Yatch Club',
    'BAYC'
  )) as ReserveTokenERC721;
  await BAYC.deployed();

  CARS = (await Erc1155.deploy()) as ReserveTokenERC1155;
  await CARS.deployed();
  PLANES = (await Erc1155.deploy()) as ReserveTokenERC1155;
  await PLANES.deployed();
  SHIPS = (await Erc1155.deploy()) as ReserveTokenERC1155;
  await SHIPS.deployed();

  rTKN = (await Erc20.deploy('Rain Token', 'rTKN')) as Token;
  await rTKN.deployed();

  const pathExampleConfig = path.resolve(__dirname, '../config/localhost.json');
  const config = JSON.parse(fetchFile(pathExampleConfig));

  config.network = 'localhost';

  config.rain1155 = rain1155.address;
  config.rain1155Block = rain1155.deployTransaction.blockNumber;

  const pathConfigLocal = path.resolve(__dirname, '../config/localhost.json');
  writeFile(pathConfigLocal, JSON.stringify(config, null, 2));
});

describe('Rain1155 Test', function () {
  it('Contract should be deployed.', async function () {
    expect(rain1155.address).to.be.not.null;
  });

  it('Should deploy all tokens', async function () {
    expect(USDT.address).to.be.not.null;
    expect(BNB.address).to.be.not.null;
    expect(SOL.address).to.be.not.null;
    expect(XRP.address).to.be.not.null;
  });

  it.only('Build and evaluate the script using ', async function () {
    const ifConditionERC20: conditionObject = {
      type: RuleType.OPERATOR,
      operator: OperatorType.AND,
      children: [
        {
          type: RuleType.CONDITION,
          condition: {
            conditionType: ConditionType.GT_ERC20,
            contractAddress: USDT.address,
            value: ethers.BigNumber.from('100' + eighteenZeros),
          },
        },
        {
          type: RuleType.CONDITION,
          condition: {
            conditionType: ConditionType.EQ_ERC20,
            contractAddress: SOL.address,
            value: ethers.BigNumber.from('10' + eighteenZeros),
          },
        },
      ],
    };

    const ifConditionNONE: conditionObject = {
      type: RuleType.OPERATOR,
      operator: OperatorType.AND,
      children: [
        {
          type: RuleType.CONDITION,
          condition: {
            conditionType: ConditionType.NONE
          }
        }
      ]
    }

    let ifCondition = ifConditionERC20;

    let ruleObject = {
      quantity: {
        if: ifCondition,
        then: {
          type: RuleType.CONDITION,
          condition: {
            conditionType: ConditionType.CONSTANT,
            value: BigNumber.from(20)
          }
        },
        else: {
          type: RuleType.CONDITION,
          condition: {
            conditionType: ConditionType.CONSTANT,
            value: BigNumber.from(7)
          }
        }
      },
      price: {
        if: ifCondition,
        then: {
          type: RuleType.CONDITION,
          condition: {
            conditionType: ConditionType.CONSTANT,
            value: BigNumber.from(10)
          }
        },
        else: {
          type: RuleType.CONDITION,
          condition: {
            conditionType: ConditionType.CONSTANT,
            value: BigNumber.from(1)
          }
        }
      }
    }

    let ruleScript = Rain1155SDK.generateScript(ruleObject);
    console.log("\nRULE SCRIPT : ---------------------\n", ruleScript, "\n------------------------\n");

    // Run using RainJS
    await USDT.connect(buyer1).mintTokens(101);
    await SOL.connect(buyer1).mintTokens(10);
    const assetConfig: AssetConfig = {
      lootBoxId: ethers.BigNumber.from(0),
      vmStateConfig: ruleScript,
      currencies: [],
      name: 'F1',
      description: 'BRUUUUMMM BRUUUMMM',
      recipient: creator.address,
      tokenURI:
        'https://ipfs.io/ipfs/QmVfbKBM7XxqZMRFzRGPGkWT8oUFNYY1DeK5dcoTgLuV8H',
    };

    // console.log(assetConfig.vmStateConfig);
    await rain1155.connect(creator).createNewAsset(assetConfig);
    console.log(await rain1155.canMint(1, buyer1.address));

    // Run using JSVM
    // const rainJs = new RainJS(ruleScript);
    // const result = await rainJs.run();
    // console.log("\n\nResult : \n", result)
  });
  
  // it('Shoule use the AssetOp SDK Function to generate script', async function () {
  //   // ------------------------------------------------- A && B
  //   let gatingCondition: conditionObject = {
  //     type: RuleType.OPERATOR,
  //     operator: OperatorType.AND,
  //     children: [
  //       {
  //         type: RuleType.CONDITION,
  //         condition: {
  //           conditionType: ConditionType.GT_ERC20,
  //           contractAddress: USDT.address,
  //           value: ethers.BigNumber.from('100'),
  //         },
  //       },
  //       {
  //         type: RuleType.CONDITION,
  //         condition: {
  //           conditionType: ConditionType.EQ_ERC20,
  //           contractAddress: SOL.address,
  //           value: ethers.BigNumber.from('10' + eighteenZeros),
  //         },
  //       },
  //     ],
  //   };

  //   await USDT.connect(buyer1).mintTokens(101);
  //   await SOL.connect(buyer1).mintTokens(10);
  //   let script = Rain1155SDK.generateScript(gatingCondition);
  //   console.log("SCRIPT : \n\n", script);
  //   const assetConfig: AssetConfig = {
  //     lootBoxId: ethers.BigNumber.from(0),
  //     vmStateConfig: script,
  //     currencies: [],
  //     name: 'F1',
  //     description: 'BRUUUUMMM BRUUUMMM',
  //     recipient: creator.address,
  //     tokenURI:
  //       'https://ipfs.io/ipfs/QmVfbKBM7XxqZMRFzRGPGkWT8oUFNYY1DeK5dcoTgLuV8H',
  //   };
  //   // console.log(assetConfig.vmStateConfig);
  //   await rain1155.connect(creator).createNewAsset(assetConfig);
  //   console.log(await rain1155.canMint(1, buyer1.address));
  // });

  // await USDT.connect(buyer1).mintTokens(101);
  // await SOL.connect(buyer1).mintTokens(10);
  // let script = Rain1155SDK.generateScript(gatingCondition);
  // const assetConfig: AssetConfig = {
  //   lootBoxId: ethers.BigNumber.from(0),
  //   vmStateConfig: script,
  //   currencies: [],
  //   name: 'F1',
  //   description: 'BRUUUUMMM BRUUUMMM',
  //   recipient: creator.address,
  //   tokenURI:
  //     'https://ipfs.io/ipfs/QmVfbKBM7XxqZMRFzRGPGkWT8oUFNYY1DeK5dcoTgLuV8H',
  // };
  // console.log(assetConfig.vmStateConfig);
  // await rain1155.connect(creator).createNewAsset(assetConfig);
  // console.log(await rain1155.canMint(1, buyer1.address));

});
