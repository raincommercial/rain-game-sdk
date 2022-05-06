const addressBook = [
  {
    chainId: 80001,
    addresses: {
      rain1155: '0x1BFb7231B152D9dB6Cc87c7933B5dea765e51Dd3',
    },
  },
  {
    // These addresess are deployed in HH Network (test)
    chainId: 31337,
    addresses: {
      rain1155: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
    },
  },
];

/**
 * @public
 * Type for all the addresses stored in the Book
 */
export type Addresses = {
  [key: string]: string;
  rain1155: string;
};

/**
 *  @public
 */
export class AddressBook {
  public static getAddressesForChainId = (chainId: number): Addresses => {
    const network = addressBook.find(n => n.chainId === chainId);
    if (!network?.addresses) {
      throw new Error('No deployed contracts for this chain.');
    }
    return network.addresses;
  };
}
