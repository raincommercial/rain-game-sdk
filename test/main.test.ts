import path from 'path';
import { it } from 'mocha';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { price } from '../src/classes/types';
import type { Token } from '../typechain/Token';
import { Currency, RuleBuilder } from 'rain-sdk';
import { AllStandardOpsStateBuilder } from '../typechain';
import { eighteenZeros, fetchFile, writeFile } from './utils';
import type { ReserveToken } from '../typechain/ReserveToken';
import { Rain1155 as Rain1155SDK, AssetConfig } from '../src/classes/rain1155';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import type { Rain1155, Rain1155ConfigStruct } from '../typechain/Rain1155';
import type { ReserveTokenERC1155 } from '../typechain/ReserveTokenERC1155';
import type { ReserveTokenERC721 } from '../typechain/ReserveTokenERC721';

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

  rain1155SDK = new Rain1155SDK(rain1155.address, buyer1);

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

  // const pathExampleConfig = path.resolve(__dirname, '../config/localhost.json');
  // const config = JSON.parse(fetchFile(pathExampleConfig));

  // config.network = 'localhost';

  // config.rain1155 = rain1155.address;
  // config.rain1155Block = rain1155.deployTransaction.blockNumber;

  // const pathConfigLocal = path.resolve(__dirname, '../config/localhost.json');
  // writeFile(pathConfigLocal, JSON.stringify(config, null, 2));
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

  it('it should correctly build the StateConfig from RuleBuilder and deploy the asset and buy', async function () {
    const currencyObject: Currency[] = [
      // currency 1
      {
        rules: [
          {
            quantityConditions: {
              conditions: [
                {
                  struct: {
                    subject: 'constant',
                    args: {
                      value: BigNumber.from(1)
                    }
                  },
                  operator: 'true'
                },
              ],
              operator: 'true'
            },
            priceConditions: {
              conditions: [
                {
                  struct: {
                    subject: 'constant',
                    args: {
                      value: BigNumber.from(1)
                    }
                  },
                  operator: 'true'
                }
              ],
              operator: 'true'
            },
            quantity: {
              struct: {
                subject: 'constant',
                args: {
                  value: BigNumber.from("10")
                }
              }
            },
            price: {
              struct: {
                subject: 'constant',
                args: {
                  value: BigNumber.from("1" + eighteenZeros)
                }
              }
            }
          },
        ],
        default: {
          quantity: {
            struct: {
              subject: 'constant',
              args: {
                value: ethers.constants.Zero
              }
            }
          },
          price: {
            struct: {
              subject: 'constant',
              args: {
                value: ethers.constants.MaxUint256
              }
            }
          }
        },
        pick: {
          quantities: 'max',
          prices: 'min'
        }
      },
      // currency 2
      {
        rules: [
          {
            quantityConditions: {
              conditions: [
                {
                  struct: {
                    subject: 'constant',
                    args: {
                      value: BigNumber.from(1)
                    }
                  },
                  operator: 'true'
                },
              ],
              operator: 'true'
            },
            priceConditions: {
              conditions: [
                {
                  struct: {
                    subject: 'constant',
                    args: {
                      value: BigNumber.from(1)
                    }
                  },
                  operator: 'true'
                }
              ],
              operator: 'true'
            },
            quantity: {
              struct: {
                subject: 'constant',
                args: {
                  value: BigNumber.from("10")
                }
              }
            },
            price: {
              struct: {
                subject: 'constant',
                args: {
                  value: BigNumber.from("25" + eighteenZeros)
                }
              }
            }
          },
        ],
        default: {
          quantity: {
            struct: {
              subject: 'constant',
              args: {
                value: ethers.constants.Zero
              }
            }
          },
          price: {
            struct: {
              subject: 'constant',
              args: {
                value: ethers.constants.MaxUint256
              }
            }
          }
        },
        pick: {
          quantities: 'max',
          prices: 'min'
        }
      }
    ]
    let ruleScript = Rain1155SDK.generateScript(currencyObject)

    console.log("\nRULE SCRIPT : ---------------------\n", ruleScript, "\n------------------------\n");

    const assetConfig: AssetConfig = {
      lootBoxId: 0,
      vmStateConfig: ruleScript,
      currencies: {
        token: [USDT.address, BNB.address],
        tokenType: [0, 0],
        tokenId: [0, 0]
      },
      name: "F1",
      description: "BRUUUUMMM BRUUUMMM",
      recipient: creator.address,
      tokenURI: "https://ipfs.io/ipfs/QmVfbKBM7XxqZMRFzRGPGkWT8oUFNYY1DeK5dcoTgLuV8H",
    }

    await rain1155.connect(gameAsstesOwner).createNewAsset(assetConfig);

    let assetData = await rain1155.assets(1)
    let expectAsset = {
      lootBoxId: assetData.lootBoxId,
      tokenURI: assetData.tokenURI,
      creator: assetData.recipient,
    }

    expect(expectAsset).to.deep.equals({
      lootBoxId: ethers.BigNumber.from("0"),
      tokenURI: "https://ipfs.io/ipfs/QmVfbKBM7XxqZMRFzRGPGkWT8oUFNYY1DeK5dcoTgLuV8H",
      creator: creator.address,
    },'Something is not rught, asset data is wrong');

    await USDT.connect(buyer1).mintTokens(1);
    await BNB.connect(buyer1).mintTokens(25);

    let USDTPrice = (await rain1155.getCurrencyPrice(1, USDT.address, buyer1.address, 1))[0]
    let BNBPrice = (await rain1155.getCurrencyPrice(1, BNB.address, buyer1.address, 1))[0]

    await USDT.connect(buyer1).approve(rain1155.address, USDTPrice);
    await BNB.connect(buyer1).approve(rain1155.address, BNBPrice);

    await rain1155.connect(buyer1).mintAssets(1,1);

    expect(await rain1155.balanceOf(buyer1.address, 1)).to.deep.equals(ethers.BigNumber.from("1"))

    expect(await USDT.balanceOf(creator.address)).to.deep.equals(ethers.BigNumber.from("1" + eighteenZeros))
    expect(await BNB.balanceOf(creator.address)).to.deep.equals(ethers.BigNumber.from("25" + eighteenZeros)
    )
    expect(await USDT.balanceOf(buyer1.address)).to.deep.equals(ethers.BigNumber.from("0" + eighteenZeros))
    expect(await BNB.balanceOf(buyer1.address)).to.deep.equals(ethers.BigNumber.from("0" + eighteenZeros))

  });
});