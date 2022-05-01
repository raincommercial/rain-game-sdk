import { expect } from 'chai';
import { ethers } from 'hardhat';
import {
  chainId,
  Tier,
  TierLevels,
  Addresses,
  deployErc20,
  deployErc721,
  expectAsyncError,
} from './utils';

import {
  AddressBook,
  GameAssets,
  AllStandardOps,
} from '../dist';
import { Signer } from 'ethers';

/**
 * Addresses saved that are in SDK BookAddresses deployed to Hardhat network.
 * **These addresses are deterministically generated with the HH signers.**
 */
export let addresses: Addresses;

before('Initializing and deploying contracts to hardhat network', async () => {
  // Contract Factories instances
  // const GameAssetsFactoryFactory = await ethers.getContractFactory(
  //   'GameAssets'
  // );

  // // Deployments to hardhat test network
  // const GameAssetsFactory = await GameAssetsFactoryFactory.deploy();

  // // Saving the addresses to our test
  // addresses = {
  //   GameAssetsFactory: GameAssetsFactory.address,
  // };
});

describe('Rain Game SDK - Test', () => {
  // describe('BookAddress', () => {
  //   it('should fail if no address stored in the book for a chain', () => {
  //     const arbitraryId = 1234;
  //     expect(() => AddressBook.getAddressesForChainId(arbitraryId)).to.throw(
  //       Error,
  //       'No deployed contracts for this chain.'
  //     );
  //   });

  //   it('should get the address directly from the book', () => {
  //     const address = AddressBook.getAddressesForChainId(chainId)
  //       .gameAssetsFactory;
  //     expect(address).to.be.equals(addresses.GameAssetsFactory);
  //   });

  //   it('should get the GameAssetsFactory address', () => {
  //     const address = GameAssets.getBookAddress(chainId);
  //     expect(address).to.be.equals(addresses.GameAssetsFactory);
  //   });
  // });

  it("it Should get deployed contract on mumbai",async () => {
    let signer = await ethers.getSigners();
    console.log("Signer : ", signer[0].address)
    let gameAssetsAddress = AddressBook.getAddressesForChainId(80001).gameAssets
    let gameAssets = new GameAssets(gameAssetsAddress, signer[0]);
    console.log( await gameAssets.assets(1));
  })
});
