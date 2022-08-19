const addressBook = [
  {
    chainId: 80001,
    addresses: {
      rain1155: '0xB17FDa45C789e5B8509Bcc70F97922F084E48AB9',
    },
  },
  {
    // These addresess are deployed in HH Network (test)
    chainId: 31337,
    addresses: {
      rain1155: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
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
