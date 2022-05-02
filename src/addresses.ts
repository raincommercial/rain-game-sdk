const addressBook = [
  {
    chainId: 80001,
    addresses: {
      gameAssets: '0x3bCF3423380E21d0e724165bc8Bd8499636586ED',
    },
  },
  {
    // These addresess are deployed in HH Network (test)
    chainId: 31337,
    addresses: {
      gameAssets: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
    },
  },
];

/**
 * @public
 * Type for all the addresses stored in the Book
 */
export type Addresses = {
  [key: string]: string;
  gameAssets: string;
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
