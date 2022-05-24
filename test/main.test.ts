const { expect } = require("chai");
const { artifacts, ethers, } = require("hardhat");
const { expectRevert } = require('@openzeppelin/test-helpers')

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { it } from "mocha";
import type { Rain1155 } from "../typechain/Rain1155";
import type { Token } from "../typechain/Token";
import type { ReserveToken } from "../typechain/ReserveToken";
import type { ReserveTokenERC1155 } from "../typechain/ReserveTokenERC1155";
import type { ReserveTokenERC721 } from "../typechain/ReserveTokenERC721";
import type { ERC20BalanceTierFactory } from "../typechain/ERC20BalanceTierFactory";
import type { ERC20BalanceTier } from "../typechain/ERC20BalanceTier";
import { Rain1155 as Rain1155SDK, Type, Conditions, condition, price, AssetConfig } from "../dist";

import { eighteenZeros, getEventArgs, fetchFile, writeFile, exec } from "./utils"
import { Contract } from "ethers";
import path from "path";

const LEVELS = Array.from(Array(8).keys()).map((value) =>
  ethers.BigNumber.from(++value + eighteenZeros)
); // [1,2,3,4,5,6,7,8]

export let rain1155: Rain1155

export let rain1155SDK: Rain1155SDK

export let USDT: ReserveToken

export let BNB: Token
export let SOL: Token
export let XRP: Token
export let rTKN: Token
export let BAYC: ReserveTokenERC721

export let CARS: ReserveTokenERC1155
export let PLANES: ReserveTokenERC1155
export let SHIPS: ReserveTokenERC1155

export let erc20BalanceTier: ERC20BalanceTier

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
admin: SignerWithAddress

export let prices: price[]

before("Deploy Rain1155 Contract and subgraph", async function () {
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


  let Rain1155 = await ethers.getContractFactory("Rain1155")

  rain1155 = await Rain1155.deploy()

  await rain1155.deployed();

  rain1155SDK = new Rain1155SDK(rain1155.address, owner);

  const Erc20 = await ethers.getContractFactory("Token");
  const stableCoins = await ethers.getContractFactory("ReserveToken");
  const Erc721 = await ethers.getContractFactory("ReserveTokenERC721");
  const Erc1155 = await ethers.getContractFactory("ReserveTokenERC1155");

  USDT = await stableCoins.deploy();
  await USDT.deployed();
  BNB = await Erc20.deploy("Binance", "BNB");
  await BNB.deployed();
  SOL = await Erc20.deploy("Solana", "SOL");
  await SOL.deployed();
  XRP = await Erc20.deploy("Ripple", "XRP");
  await XRP.deployed();

  BAYC = await Erc721.deploy("Boared Ape Yatch Club", "BAYC");
  await BAYC.deployed()

  CARS = await Erc1155.deploy();
  await CARS.deployed();
  PLANES = await Erc1155.deploy();
  await PLANES.deployed();
  SHIPS = await Erc1155.deploy();
  await SHIPS.deployed();

  rTKN = await Erc20.deploy("Rain Token", "rTKN");
  await rTKN.deployed()

  const erc20BalanceTierFactoryFactory = await ethers.getContractFactory("ERC20BalanceTierFactory");
  const erc20BalanceTierFactory = (await erc20BalanceTierFactoryFactory.deploy()) as ERC20BalanceTierFactory & Contract;
  await erc20BalanceTierFactory.deployed()

  const tx = await erc20BalanceTierFactory.createChildTyped({
    erc20: rTKN.address,
    tierValues: LEVELS
  });

  erc20BalanceTier = new ethers.Contract(
    ethers.utils.hexZeroPad(
      ethers.utils.hexStripZeros(
        (await getEventArgs(tx, "NewChild", erc20BalanceTierFactory)).child
      ),
      20
    ),
    (await artifacts.readArtifact("ERC20BalanceTier")).abi,
    owner
  ) as ERC20BalanceTier & Contract;

  await erc20BalanceTier.deployed();

  const pathExampleConfig = path.resolve(__dirname, "../config/localhost.json");
  const config = JSON.parse(fetchFile(pathExampleConfig));

  config.network = "localhost";

  config.rain1155 = rain1155.address;
  config.rain1155Block = rain1155.deployTransaction.blockNumber;

  // console.log("Config : ", JSON.stringify(config, null, 2));
  const pathConfigLocal = path.resolve(__dirname, "../config/localhost.json");
  writeFile(pathConfigLocal, JSON.stringify(config, null, 2));

  // try {
  //   exec(`npm run deploy:localhost`);
  // }catch(error){
  //   console.log(`Subgraph deployment failed : ${error}`);
  // }
})

describe("Rain1155 Test", function () {
  it("Contract should be deployed.", async function () {
    expect(rain1155.address).to.be.not.null;
  });

  it("Should deploy all tokens", async function () {
    expect(USDT.address).to.be.not.null;
    expect(BNB.address).to.be.not.null;
    expect(SOL.address).to.be.not.null;
    expect(XRP.address).to.be.not.null;
    // console.log(USDT.address, BNB.address, SOL.address, XRP.address)
  });

  it("Should create asset '1' from creator. [AND - OR gating rules ((A && B) || (C && D)) ]", async function () {

    prices = [
      {
        currency: {
          type: Type.ERC20,
          address: USDT.address,
        },
        amount: ethers.BigNumber.from("1" + eighteenZeros)
      },
      {
        currency: {
          type: Type.ERC20,
          address: BNB.address,
        },
        amount: ethers.BigNumber.from("25" + eighteenZeros)
      },
      {
        currency: {
          type: Type.ERC1155,
          address: CARS.address,
          tokenId: 5,
        },
        amount: ethers.BigNumber.from("10")
      },
      {
        currency: {
          type: Type.ERC1155,
          address: PLANES.address,
          tokenId: 15,
        },
        amount: ethers.BigNumber.from("5")
      },
    ];
    const [priceConfig, currencies] = Rain1155SDK.generatePriceScript(prices);

    // console.log(Rain1155SDK.generatePriceConfig(priceConfig, currencies));

    const tierCondition = 4
    const blockCondition = 15

    const conditions1: condition[] = [
      {
        type: Conditions.NONE
      },
      {
        type: Conditions.BLOCK_NUMBER,
        blockNumber: blockCondition
      },
      {
        type: Conditions.BALANCE_TIER,
        tierAddress: erc20BalanceTier.address,
        tierCondition: tierCondition
      },
      {
        type: Conditions.ERC20BALANCE,
        address: USDT.address,
        balance: ethers.BigNumber.from("10" + eighteenZeros)
      },
    ];

    const conditions2: condition[] = [
      {
        type: Conditions.ERC20BALANCE,
        address: SOL.address,
        balance: ethers.BigNumber.from("10" + eighteenZeros)
      },
      {
        type: Conditions.BLOCK_NUMBER,
        blockNumber: blockCondition
      },
      {
        type: Conditions.BALANCE_TIER,
        tierAddress: erc20BalanceTier.address,
        tierCondition: tierCondition
      }

    ];

    const conditions3: condition[] = [
      {
        type: Conditions.ERC721BALANCE,
        address: BAYC.address,
        balance: ethers.BigNumber.from("0")
      },
      {
        type: Conditions.ERC1155BALANCE,
        address: SHIPS.address,
        id: ethers.BigNumber.from("1"),
        balance: ethers.BigNumber.from("10")
      },
      {
        type: Conditions.ERC20BALANCE,
        address: BNB.address,
        balance: ethers.BigNumber.from("10" + eighteenZeros)
      }
    ];

    const canMintConfig = Rain1155SDK.generateCanMintScript([conditions1, conditions2, conditions3]);
    const assetConfig: AssetConfig = {
      lootBoxId: ethers.BigNumber.from(0),
      priceScript: priceConfig,
      canMintScript: canMintConfig,
      currencies: currencies,
      name: "F1",
      description: "BRUUUUMMM BRUUUMMM",
      recipient: creator.address,
      tokenURI: "https://ipfs.io/ipfs/QmVfbKBM7XxqZMRFzRGPGkWT8oUFNYY1DeK5dcoTgLuV8H",
    }

    // console.log(rain1155SDK.generateCanMintConfig(canMintConfig));
    await rain1155SDK.connect(gameAsstesOwner).createNewAsset(assetConfig);

    let assetData = await rain1155SDK.assets(1)
    let expectAsset = {
      lootBoxId: assetData.lootBoxId,
      tokenURI: assetData.tokenURI,
      creator: assetData.recipient,
    }

    expect(expectAsset).to.deep.equals({
      lootBoxId: ethers.BigNumber.from("0"),
      tokenURI: "https://ipfs.io/ipfs/QmVfbKBM7XxqZMRFzRGPGkWT8oUFNYY1DeK5dcoTgLuV8H",
      creator: creator.address,
    })

  });

  it("Should buy asset '1'", async function () {
    let assetId = 1;
    await rTKN.connect(buyer1).mintTokens(5)

    await USDT.connect(buyer1).mintTokens(15);
    await CARS.connect(buyer1).mintTokens(ethers.BigNumber.from("5"), 10)
    
    let USDTPrice = (await rain1155SDK.getPrice(1, USDT.address, 1))
    await USDT.connect(buyer1).approve(rain1155.address, USDTPrice.amount);
    await CARS.connect(buyer1).setApprovalForAll(rain1155.address, true);


    console.log(await rain1155SDK.checkAllowance(1, prices, 1, rain1155.address, buyer1.address))

    
    await SOL.connect(buyer1).mintTokens(10);
    
    await BAYC.connect(buyer1).mintNewToken();
    
    await BNB.connect(buyer1).mintTokens(25);
    await PLANES.connect(buyer1).mintTokens(ethers.BigNumber.from("15"), 5)
    await SHIPS.connect(buyer1).mintTokens(ethers.BigNumber.from("10"), 11)

    let BNBPrice = (await rain1155SDK.getPrice(1, BNB.address, 1))


    await BNB.connect(buyer1).approve(rain1155.address, BNBPrice.amount);

    await PLANES.connect(buyer1).setApprovalForAll(rain1155.address, true);

    await rain1155SDK.connect(buyer1).mintAssets(assetId, 1);

    expect(await rain1155SDK.balanceOf(buyer1.address, assetId)).to.deep.equals(ethers.BigNumber.from("1"))

    expect(await USDT.balanceOf(creator.address)).to.deep.equals(ethers.BigNumber.from("1" + eighteenZeros))
    expect(await BNB.balanceOf(creator.address)).to.deep.equals(ethers.BigNumber.from("25" + eighteenZeros))
    expect(await CARS.balanceOf(creator.address, 5)).to.deep.equals(ethers.BigNumber.from("10"))
    expect(await PLANES.balanceOf(creator.address, 15)).to.deep.equals(ethers.BigNumber.from("5"))
    expect(await USDT.balanceOf(buyer1.address)).to.deep.equals(ethers.BigNumber.from("14" + eighteenZeros))
    expect(await BNB.balanceOf(buyer1.address)).to.deep.equals(ethers.BigNumber.from("0" + eighteenZeros))
    expect(await CARS.balanceOf(buyer1.address, 5)).to.deep.equals(ethers.BigNumber.from("0"))
    expect(await PLANES.balanceOf(buyer1.address, 15)).to.deep.equals(ethers.BigNumber.from("0"))
  });

  it("Should not be able to buy asset '1' after failing to satisfy the gating rules.", async function () {
    let assetId = 1;
    await rTKN.connect(buyer2).mintTokens(5)

    await USDT.connect(buyer2).mintTokens(9); // Will fail here
    await BNB.connect(buyer2).mintTokens(25);

    await SOL.connect(buyer2).mintTokens(5); // Will fail here

    await BAYC.connect(buyer2).mintNewToken();

    await CARS.connect(buyer2).mintTokens(ethers.BigNumber.from("5"), 10)
    await PLANES.connect(buyer2).mintTokens(ethers.BigNumber.from("15"), 5)
    await SHIPS.connect(buyer2).mintTokens(ethers.BigNumber.from("5"), 11) // Will fail here

    let USDTPrice = (await rain1155SDK.getAssetPrice(assetId, USDT.address, 1))[1]
    let BNBPrice = (await rain1155SDK.getAssetPrice(assetId, BNB.address, 1))[1]

    await USDT.connect(buyer2).approve(rain1155.address, USDTPrice);
    await BNB.connect(buyer2).approve(rain1155.address, BNBPrice);

    await CARS.connect(buyer2).setApprovalForAll(rain1155.address, true);
    await PLANES.connect(buyer2).setApprovalForAll(rain1155.address, true);

    await expectRevert(
      rain1155SDK.connect(buyer2).mintAssets(assetId, 1),
      "Cant Mint"
    )
    expect(await rain1155SDK.balanceOf(buyer2.address, assetId)).to.deep.equals(ethers.BigNumber.from("0"))

  });

  it("Should create asset '2' from creator. [AND gating rules (A && B && C) ]", async function () {

    const prices: price[] = [
      {
        currency: {
          type: Type.ERC20,
          address: USDT.address,
        },
        amount: ethers.BigNumber.from("1" + eighteenZeros)
      },
      {
        currency: {
          type: Type.ERC20,
          address: BNB.address,
        },
        amount: ethers.BigNumber.from("25" + eighteenZeros)
      },
      {
        currency: {
          type: Type.ERC1155,
          address: CARS.address,
          tokenId: 5,
        },
        amount: ethers.BigNumber.from("10")
      },
      {
        currency: {
          type: Type.ERC1155,
          address: PLANES.address,
          tokenId: 15,
        },
        amount: ethers.BigNumber.from("5")
      },
    ];

    const [priceConfig, currencies] = Rain1155SDK.generatePriceScript(prices);

    const tierCondition = 4
    const blockCondition = 15

    const conditions1: condition[] = [
      {
        type: Conditions.NONE
      },
      {
        type: Conditions.BLOCK_NUMBER,
        blockNumber: blockCondition
      },
      {
        type: Conditions.ERC20BALANCE,
        address: SOL.address,
        balance: ethers.BigNumber.from("10" + eighteenZeros)
      },
      {
        type: Conditions.ERC20BALANCE,
        address: USDT.address,
        balance: ethers.BigNumber.from("10" + eighteenZeros)
      },
    ];

    const canMintConfig = Rain1155SDK.generateCanMintScript([conditions1]);
    const assetConfig: AssetConfig = {
      lootBoxId: ethers.BigNumber.from(0),
      priceScript: priceConfig,
      canMintScript: canMintConfig,
      currencies: currencies,
      name: "F1",
      description: "BRUUUUMMM BRUUUMMM",
      recipient: creator.address,
      tokenURI: "https://ipfs.io/ipfs/QmVfbKBM7XxqZMRFzRGPGkWT8oUFNYY1DeK5dcoTgLuV8H",
    }

    // console.log(rain1155SDK.generateCanMintConfig(canMintConfig));
    await rain1155SDK.connect(gameAsstesOwner).createNewAsset(assetConfig);

    let assetData = await rain1155SDK.assets(2)
    let expectAsset = {
      lootBoxId: assetData.lootBoxId,
      tokenURI: assetData.tokenURI,
      creator: assetData.recipient,
    }

    expect(expectAsset).to.deep.equals({
      lootBoxId: ethers.BigNumber.from("0"),
      tokenURI: "https://ipfs.io/ipfs/QmVfbKBM7XxqZMRFzRGPGkWT8oUFNYY1DeK5dcoTgLuV8H",
      creator: creator.address,
    })
  });

  it("Should buy asset '2'", async function () {
    let assetId = 2;
    await rTKN.connect(buyer3).mintTokens(5)

    await USDT.connect(buyer3).mintTokens(15);
    await BNB.connect(buyer3).mintTokens(25);

    await SOL.connect(buyer3).mintTokens(50);

    await CARS.connect(buyer3).mintTokens(ethers.BigNumber.from("5"), 10)
    await PLANES.connect(buyer3).mintTokens(ethers.BigNumber.from("15"), 5)

    let USDTPrice = (await rain1155SDK.getAssetPrice(assetId, USDT.address, 1))[1]
    let BNBPrice = (await rain1155SDK.getAssetPrice(assetId, BNB.address, 1))[1]

    await USDT.connect(buyer3).approve(rain1155.address, USDTPrice);
    await BNB.connect(buyer3).approve(rain1155.address, BNBPrice);

    await CARS.connect(buyer3).setApprovalForAll(rain1155.address, true);
    await PLANES.connect(buyer3).setApprovalForAll(rain1155.address, true);

    await rain1155SDK.connect(buyer3).mintAssets(assetId, 1);

    expect(await rain1155SDK.balanceOf(buyer3.address, assetId)).to.deep.equals(ethers.BigNumber.from("1"))

    expect(await USDT.balanceOf(creator.address)).to.deep.equals(ethers.BigNumber.from("2" + eighteenZeros))
    expect(await BNB.balanceOf(creator.address)).to.deep.equals(ethers.BigNumber.from("50" + eighteenZeros))
    expect(await CARS.balanceOf(creator.address, 5)).to.deep.equals(ethers.BigNumber.from("20"))
    expect(await PLANES.balanceOf(creator.address, 15)).to.deep.equals(ethers.BigNumber.from("10"))
    expect(await USDT.balanceOf(buyer3.address)).to.deep.equals(ethers.BigNumber.from("14" + eighteenZeros))
    expect(await BNB.balanceOf(buyer3.address)).to.deep.equals(ethers.BigNumber.from("0" + eighteenZeros))
    expect(await CARS.balanceOf(buyer3.address, 5)).to.deep.equals(ethers.BigNumber.from("0"))
    expect(await PLANES.balanceOf(buyer3.address, 15)).to.deep.equals(ethers.BigNumber.from("0"))
  });

  it("Should not be able to buy asset '2' after failing to satisfy the gating rules.", async function () {
    let assetId = 2;
    await rTKN.connect(buyer4).mintTokens(5)

    await USDT.connect(buyer4).mintTokens(5); // Will failt here
    await BNB.connect(buyer4).mintTokens(25);

    await SOL.connect(buyer4).mintTokens(50);

    await CARS.connect(buyer4).mintTokens(ethers.BigNumber.from("5"), 10)
    await PLANES.connect(buyer4).mintTokens(ethers.BigNumber.from("15"), 5)

    let USDTPrice = (await rain1155SDK.getAssetPrice(assetId, USDT.address, 1))[1]
    let BNBPrice = (await rain1155SDK.getAssetPrice(assetId, BNB.address, 1))[1]

    await USDT.connect(buyer4).approve(rain1155.address, USDTPrice);
    await BNB.connect(buyer4).approve(rain1155.address, BNBPrice);

    await CARS.connect(buyer4).setApprovalForAll(rain1155.address, true);
    await PLANES.connect(buyer4).setApprovalForAll(rain1155.address, true);

    await expectRevert(
      rain1155SDK.connect(buyer4).mintAssets(assetId, 1),
      "Cant Mint"
    )

    expect(await rain1155SDK.balanceOf(buyer4.address, assetId)).to.deep.equals(ethers.BigNumber.from("0"))

  });

  it("Should create asset '3' from creator. [OR gating rules (A || B || C) ]", async function () {

    const prices: price[] = [
      {
        currency: {
          type: Type.ERC20,
          address: USDT.address,
        },
        amount: ethers.BigNumber.from("1" + eighteenZeros)
      },
      {
        currency: {
          type: Type.ERC20,
          address: BNB.address,
        },
        amount: ethers.BigNumber.from("5" + eighteenZeros)
      },
      {
        currency: {
          type: Type.ERC1155,
          address: CARS.address,
          tokenId: 5,
        },
        amount: ethers.BigNumber.from("10")
      },
      {
        currency: {
          type: Type.ERC1155,
          address: PLANES.address,
          tokenId: 15,
        },
        amount: ethers.BigNumber.from("5")
      },
    ];

    const [priceConfig, currencies] = Rain1155SDK.generatePriceScript(prices);

    const conditions1: condition[] = [
      {
        type: Conditions.ERC20BALANCE,
        address: SOL.address,
        balance: ethers.BigNumber.from("10" + eighteenZeros)
      }
    ];
    const conditions2: condition[] = [
      {
        type: Conditions.ERC20BALANCE,
        address: BNB.address,
        balance: ethers.BigNumber.from("25" + eighteenZeros)
      },
    ];
    const conditions3: condition[] = [
      {
        type: Conditions.ERC20BALANCE,
        address: USDT.address,
        balance: ethers.BigNumber.from("10" + eighteenZeros)
      },
    ];

    const canMintConfig = Rain1155SDK.generateCanMintScript([conditions1, conditions2, conditions3]);
    const assetConfig: AssetConfig = {
      lootBoxId: ethers.BigNumber.from(0),
      priceScript: priceConfig,
      canMintScript: canMintConfig,
      currencies: currencies,
      name: "F1",
      description: "BRUUUUMMM BRUUUMMM",
      recipient: creator.address,
      tokenURI: "https://ipfs.io/ipfs/QmVfbKBM7XxqZMRFzRGPGkWT8oUFNYY1DeK5dcoTgLuV8H",
    }

    // console.log(rain1155SDK.generateCanMintConfig(canMintConfig));
    await rain1155SDK.connect(gameAsstesOwner).createNewAsset(assetConfig);

    let assetData = await rain1155SDK.assets(3)
    let expectAsset = {
      lootBoxId: assetData.lootBoxId,
      tokenURI: assetData.tokenURI,
      creator: assetData.recipient,
    }

    expect(expectAsset).to.deep.equals({
      lootBoxId: ethers.BigNumber.from("0"),
      tokenURI: "https://ipfs.io/ipfs/QmVfbKBM7XxqZMRFzRGPGkWT8oUFNYY1DeK5dcoTgLuV8H",
      creator: creator.address,
    })
  });

  it("Should buy asset '3'", async function () {
    await rTKN.connect(buyer5).mintTokens(5)

    await USDT.connect(buyer5).mintTokens(5); // Not Satisfying
    await BNB.connect(buyer5).mintTokens(10); // Not Satisfying

    await SOL.connect(buyer5).mintTokens(25); // Staisfying

    await CARS.connect(buyer5).mintTokens(ethers.BigNumber.from("5"), 10)
    await PLANES.connect(buyer5).mintTokens(ethers.BigNumber.from("15"), 5)

    let USDTPrice = (await rain1155SDK.getAssetPrice(3, USDT.address, 1))[1]
    let BNBPrice = (await rain1155SDK.getAssetPrice(3, BNB.address, 1))[1]
    await USDT.connect(buyer5).approve(rain1155.address, USDTPrice);
    await BNB.connect(buyer5).approve(rain1155.address, BNBPrice);
    
    await CARS.connect(buyer5).setApprovalForAll(rain1155.address, true);
    await PLANES.connect(buyer5).setApprovalForAll(rain1155.address, true);
    
    await rain1155SDK.connect(buyer5).mintAssets(3, 1);
    
    expect(await rain1155SDK.balanceOf(buyer5.address, 3)).to.deep.equals(ethers.BigNumber.from("1"))
    
    expect(await USDT.balanceOf(creator.address)).to.deep.equals(ethers.BigNumber.from("3" + eighteenZeros))
    expect(await BNB.balanceOf(creator.address)).to.deep.equals(ethers.BigNumber.from("55" + eighteenZeros))
    expect(await CARS.balanceOf(creator.address, 5)).to.deep.equals(ethers.BigNumber.from("30"))
    expect(await PLANES.balanceOf(creator.address, 15)).to.deep.equals(ethers.BigNumber.from("15"))
    expect(await USDT.balanceOf(buyer5.address)).to.deep.equals(ethers.BigNumber.from("4" + eighteenZeros))
    expect(await BNB.balanceOf(buyer5.address)).to.deep.equals(ethers.BigNumber.from("5" + eighteenZeros))
    expect(await CARS.balanceOf(buyer5.address, 5)).to.deep.equals(ethers.BigNumber.from("0"))
    expect(await PLANES.balanceOf(buyer5.address, 15)).to.deep.equals(ethers.BigNumber.from("0"))
  });
  
  it("Should not be able to buy asset '3' after failing to satisfy the gating rules.", async function () {
    await rTKN.connect(buyer6).mintTokens(5)

    await USDT.connect(buyer6).mintTokens(5); // Not Satisfying
    await BNB.connect(buyer6).mintTokens(10); // Not Satisfying

    await SOL.connect(buyer6).mintTokens(5); // Not Staisfying

    await CARS.connect(buyer6).mintTokens(ethers.BigNumber.from("5"), 10)
    await PLANES.connect(buyer6).mintTokens(ethers.BigNumber.from("15"), 5)

    let USDTPrice = (await rain1155SDK.getAssetPrice(3, USDT.address, 1))[1]
    let BNBPrice = (await rain1155SDK.getAssetPrice(3, BNB.address, 1))[1]
    await USDT.connect(buyer6).approve(rain1155.address, USDTPrice);
    await BNB.connect(buyer6).approve(rain1155.address, BNBPrice);
    
    await CARS.connect(buyer6).setApprovalForAll(rain1155.address, true);
    await PLANES.connect(buyer6).setApprovalForAll(rain1155.address, true);
    
    await expectRevert(
      rain1155SDK.connect(buyer6).mintAssets(3, 1),
      "Cant Mint"
    )
    
    expect(await rain1155SDK.balanceOf(buyer6.address, 3)).to.deep.equals(ethers.BigNumber.from("0"))
    
  });


  it("ERC type test", async () => {
    expect(await Rain1155SDK.isERC20(USDT.address, owner)).to.equals(true);
    expect(await Rain1155SDK.isERC1155(CARS.address, owner)).to.equals(true);
    expect(await Rain1155SDK.isERC721(BAYC.address, owner)).to.equals(true);
  })

  it("Should mint multiple assets",async () => {
    
    await PLANES.connect(buyer2).mintTokens(ethers.BigNumber.from("15"), 5  * 4)
    await SHIPS.connect(buyer2).mintTokens(ethers.BigNumber.from("1"), 11)

    await CARS.connect(buyer2).mintTokens(ethers.BigNumber.from("5"), 10 * 4)

    await rTKN.connect(buyer2).mintTokens(5);

    await USDT.connect(buyer2).mintTokens(1 * 4);
    await BNB.connect(buyer2).mintTokens(25 * 4);

    await SOL.connect(buyer2).mintTokens(11);

    await BAYC.connect(buyer2).mintNewToken();

    let USDTPrice = (await rain1155.getAssetPrice(1, USDT.address, 4))[1]
    let BNBPrice = (await rain1155.getAssetPrice(1, BNB.address, 4))[1]

    // console.log({USDTPrice, BNBPrice})

    await USDT.connect(buyer2).approve(rain1155.address, USDTPrice);
    await BNB.connect(buyer2).approve(rain1155.address, BNBPrice);
    
    await CARS.connect(buyer2).setApprovalForAll(rain1155.address, true);
    await PLANES.connect(buyer2).setApprovalForAll(rain1155.address, true);
    
    await rain1155.connect(buyer2).mintAssets(1,4);

    expect(await rain1155.balanceOf(buyer2.address, 1)).to.deep.equals(ethers.BigNumber.from("4"))

    // expect(await USDT.balanceOf(creator.address)).to.deep.equals(ethers.BigNumber.from("1" + eighteenZeros))
    // expect(await BNB.balanceOf(creator.address)).to.deep.equals(ethers.BigNumber.from("25" + eighteenZeros))
    // expect(await CARS.balanceOf(creator.address, 5)).to.deep.equals(ethers.BigNumber.from("10"))
    // expect(await PLANES.balanceOf(creator.address, 15)).to.deep.equals(ethers.BigNumber.from("5"))
    
    expect(await USDT.balanceOf(buyer2.address)).to.deep.equals(ethers.BigNumber.from("9" + eighteenZeros))
    expect(await BNB.balanceOf(buyer2.address)).to.deep.equals(ethers.BigNumber.from("25" + eighteenZeros))
    expect(await CARS.balanceOf(buyer2.address, 5)).to.deep.equals(ethers.BigNumber.from("10"))
    expect(await PLANES.balanceOf(buyer2.address, 15)).to.deep.equals(ethers.BigNumber.from("5"))

  });
});
