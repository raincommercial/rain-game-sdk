/* eslint-disable prettier/prettier */
import {
  Signer,
  BytesLike,
  BigNumber,
  BigNumberish,
  ContractTransaction,
  ethers,
} from 'ethers';
import {
  TxOverrides,
  ReadTxOverrides,
  RainContract,
  ERC721,
  ERC20,
  ERC1155,
  VM,
  StateConfig,
  utils,
} from 'rain-sdk';
import { Rain1155__factory } from './typechain';
import { AddressBook } from './addresses';
import { StateConfigStruct } from './typechain/Rain1155';
import {
  conditionObject,
  ConditionType,
  CurrencyType,
  price,
  RuleType,
  RuleGenerator,
  OperatorType,
  condition,
  allowance,
} from './classes/rulesGenerator';
import { getCanMintConfig, ScriptError } from './utils';
const { op, concat } = utils;

/**
 * @public
 * A class for deploying and calling methods in Rain1155 contract.
 *
 *
 * @remarks
 *   This class provides an easy way to deploy and interact with Rain1155 contracts
 *
 * @example
 * ```typescript
 * import { Rain1155 } from 'rain-sdk'
 *
 * // To connect to an existing Rain1155 just pass the address and an ethers.js Signer.
 * const existing Rain1155 = new Rain1155(address, signer)
 *
 * // Once you have a Rain1155, you can call the smart contract methods:
 * ```
 *
 */

/**
 *
 * @param prices Array of type price
 * @returns VMState: StateConfig, string[]: array of token addresses.
 */
const generatePriceScript = (
  prices: price[],
  position: number
): [Uint8Array, BigNumberish[], string[]] => {
  let error = new ScriptError('Invalid Script parameters.');
  let currencies: string[] = [];
  let sources: BytesLike[] = [];
  let constants: BigNumberish[] = [];
  let i;
  if (prices.length === 0) {
    // If empty config received return source with one opcode and empty currencies arary.
    return [concat([op(VM.Opcodes.CONSTANT)]), constants, currencies];
  }
  for (i = 0; i < prices.length; i++) {
    // else loop over the prices array
    let obj = prices[i];
    if (obj.token.tokenType === CurrencyType.ERC1155) {
      // check price type
      sources.push(op(VM.Opcodes.CONSTANT, ++position)); // token type ERC1155 = 1
      sources.push(op(VM.Opcodes.CONSTANT, ++position)); // tokeinID
      sources.push(op(VM.Opcodes.CONSTANT, ++position)); // amount
      // pushed 3 items in constants so used ++pos 3 times, then (VM.Opcodes.CONSTANT, pos) will point to correct constant
      constants.push(obj.token.tokenType); // push currency type in constants
      if (obj.token.tokenId) {
        constants.push(obj.token.tokenId); // push tokenId in constants
      } else throw error.error('ERC1155', 'currency.tokenId');
      constants.push(obj.value); // push amount in constants
    } else {
      // ERC20 type
      sources.push(op(VM.Opcodes.CONSTANT, ++position)); // token type ERC20 = 0
      sources.push(op(VM.Opcodes.CONSTANT, ++position)); // amount
      // pushed 2 items in constants so used ++pos 2 times, then (VM.Opcodes.CONSTANT, pos) will point to correct constant
      constants.push(obj.token.tokenType); // push currency type in constants
      constants.push(obj.value); // push amount in constants
    }
    currencies.push(obj.token.tokenAddress);
  }
  return [concat(sources), constants, currencies]; // return the stateConfig and currencies[]
};

/**
 *
 * @param priceScritp StateConfig generated by generatePriceScript()
 * @param currencies array of token addresses
 * @returns array of priceConfig
 */
const generatePriceConfig = (
  priceScript: StateConfig,
  currencies: string[]
): price[] => {
  let prices: price[] = [];
  let pos = -1;
  const source: BytesLike = ethers.utils.arrayify(priceScript.sources[1]); // Convert the bytesArray to Uint8Array
  const constants = priceScript.constants;
  let index = source[1];
  let i = 0;
  while (index < constants.length) {
    if (constants[index] === 0) {
      prices.push({
        token: {
          tokenType: Number(constants[index]),
          tokenAddress: currencies[i++],
        },
        value: BigNumber.from(constants[index + 1]),
      });
      index = index + 2;
    } else if (constants[index] === 1) {
      prices.push({
        token: {
          tokenType: Number(constants[index]),
          tokenId: constants[index + 1],
          tokenAddress: currencies[i++],
        },
        value: BigNumber.from(constants[index + 2]),
      });
      index = index + 3;
    }
  }
  return prices;
};

let states: StateConfig[] = [];
function generateCanMintHelper(children: conditionObject[]) {
  let error = new ScriptError('Invalid Script parameters.');
  for (let i = 0; i < children.length; i++) {
    // Loop over children
    // let states: StateConfig[] = [];

    let child = children[i];
    if (child.type === RuleType.CONDITION) {
      // If it is a condition, then fill sources and constants
      let condition = child.condition!;
      if (condition.conditionType === ConditionType.NONE) {
        // No condition
        states.push(RuleGenerator.generateNoneState());
      } else if (condition.conditionType === ConditionType.TIME_IN_BETWEEN) {
        if (condition.startTimestamp && condition.endTimestamp)
          states.push(
            RuleGenerator.generateInBetweenTimeState(
              condition.startTimestamp,
              condition.endTimestamp
            )
          );
        else
          throw error.error(
            'TIME_IN_BETWEEN',
            'startTImestamp or endTimestamp'
          );
      } else if (condition.conditionType === ConditionType.TIME_AFTER) {
        if (condition.startTimestamp)
          states.push(
            RuleGenerator.generateAfterTimeState(condition.startTimestamp)
          );
        else throw error.error('TIME_AFTER', 'startTimestamp');
      } else if (condition.conditionType === ConditionType.TIME_BEFORE) {
        if (condition.endTimestamp)
          states.push(
            RuleGenerator.generateAfterTimeState(condition.endTimestamp)
          );
        else throw error.error('TIME_AFTER', 'endTimestamp');
      } else if (condition.conditionType === ConditionType.DAYS_FROM_TODAY) {
        // states.push(generateDaysFromTodayState());
      } else if (condition.conditionType === ConditionType.EQ_ERC20) {
        if (condition.value && condition.contractAddress)
          states.push(
            RuleGenerator.generateERC20State(
              condition.contractAddress,
              condition.value,
              condition.conditionType
            )
          );
        else throw error.error('EQ_ERC20', 'address or balance');
      } else if (condition.conditionType === ConditionType.LT_ERC20) {
        if (condition.value && condition.contractAddress)
          states.push(
            RuleGenerator.generateERC20State(
              condition.contractAddress,
              condition.value,
              condition.conditionType
            )
          );
        else throw error.error('LT_ERC20', 'address or balance');
      } else if (condition.conditionType === ConditionType.GT_ERC20) {
        if (condition.value && condition.contractAddress)
          states.push(
            RuleGenerator.generateERC20State(
              condition.contractAddress,
              condition.value,
              condition.conditionType
            )
          );
        else throw error.error('GT_ERC20', 'address or balance');
      }
    } else if (child.type === RuleType.OPERATOR) {
      // If it is a operator, then call the same function recursively
      // recursive call
      generateCanMintHelper(child.children!);

      // pushing operator at the end
      if (child.operator === OperatorType.OR) {
        states.push(RuleGenerator.generateORState(children.length)); // Last OP as ANY to check any of the above condition group is true
      } else if (child.operator === OperatorType.AND) {
        states.push(RuleGenerator.generateANDState(children.length)); // Last OP as ANY to check any of the above condition group is true
      }
    }
  }
}
/**
 *
 * @param conditions array of conditions
 * @returns [Uint8Array, BigNumberish[]] for canMint
 */
const generateCanMintScript = (objects: conditionObject): StateConfig => {
  generateCanMintHelper(objects.children!);
  // pushing operator at the end
  if (objects.operator === OperatorType.OR) {
    states.push(RuleGenerator.generateORState(objects.children!.length)); // Last OP as ANY to check any of the above condition group is true
  } else if (objects.operator === OperatorType.AND) {
    states.push(RuleGenerator.generateANDState(objects.children!.length)); // Last OP as ANY to check any of the above condition group is true
  }

  let result = VM.pair(states[0], states[1]);
  for (let i = 2; i < states.length; i++) {
    result = VM.pair(result, states[i]);
  }
  return result;
};
/**
 *
 * @param canMintScript StateConfig generated by generateCanMintScript
 * @returns array of conditions
 */
const generateCanMintConfig = (canMintScript: StateConfig): condition[][] => {
  let conditions: condition[][] = [];
  let sources = ethers.utils.arrayify(canMintScript.sources[0]); // Convert from BytesArray to Uint8Array
  let constants = canMintScript.constants;
  let opcodes: number[][] = [[]];
  let opcodeCounter = 0;
  for (let i = 0; i < sources.length - 2; i++) {
    // convert Uint8Array to number[]
    let op = parseInt(sources[i].toString());
    if (!(i % 2)) {
      if (op == VM.Opcodes.EVERY) {
        // If EVERY opcode found, split the current opcode array and increment the index of sources by 1
        conditions.push(getCanMintConfig(opcodes[opcodeCounter], constants));
        opcodes[++opcodeCounter] = [];
        i++;
        continue;
      }
    }
    // If a normal opcode, then push it directly.
    opcodes[opcodeCounter].push(op);
  }
  return conditions;
};

const generateScript = (condition: conditionObject): StateConfig => {
  const script = generateCanMintScript(condition);

  // const [ priceSources, priceConstants, currencies ] = generatePriceScript(prices, canMintConstants.length - 1);

  // const sources = [canMintSource, priceSources];
  // const constants = [...canMintConstants, ...priceConstants];

  // return [
  //   {
  //     sources: sources,
  //     constants: constants
  //   },
  //   currencies
  // ];
  return script;
};

const generateConfig = (
  script: StateConfig,
  currencies: string[]
): [condition[][], price[]] => {
  const priceConfig = generatePriceConfig(script, currencies);
  const canMintConfig = generateCanMintConfig(script);
  return [canMintConfig, priceConfig];
};
export class Rain1155 extends RainContract {
  protected static readonly nameBookReference = 'Rain1155';

  /**
   * Constructs a new Rain1155 from a known address.
   *
   * @param address - The address of the Rain1155 contract
   * @param signer - An ethers.js Signer
   * @returns A new Rain1155 instance
   *
   */
  constructor(address: string, signer: Signer) {
    super(address, signer);
    const _rain1155 = Rain1155__factory.connect(address, signer);

    this.assets = _rain1155.assets;
    this.balanceOf = _rain1155.balanceOf;
    this.balanceOfBatch = _rain1155.balanceOfBatch;
    this.canMint = _rain1155.canMint;
    this.createNewAsset = _rain1155.createNewAsset;
    this.getAssetPrice = _rain1155.getAssetPrice;
    this.isApprovedForAll = _rain1155.isApprovedForAll;
    this.mintAssets = _rain1155.mintAssets;
    this.safeBatchTransferFrom = _rain1155.safeBatchTransferFrom;
    this.safeTransferFrom = _rain1155.safeTransferFrom;
    this.setApprovalForAll = _rain1155.setApprovalForAll;
    this.supportsInterface = _rain1155.supportsInterface;
    this.totalAssets = _rain1155.totalAssets;
    this.uri = _rain1155.uri;
  }

  public readonly connect = (signer: Signer): Rain1155 => {
    return new Rain1155(this.address, signer);
  };

  public static getBookAddress(chainId: number): string {
    return AddressBook.getAddressesForChainId(chainId)[this.nameBookReference];
  }

  public static readonly subgraph =
    'https://api.thegraph.com/subgraphs/name/vishalkale151071/blocks';

  public static readonly generateScript = generateScript;
  public static readonly generateConfig = generateConfig;

  public readonly getPrice = async (
    _assetId: BigNumberish,
    _paymentToken: string,
    _units: BigNumberish
  ): Promise<price> => {
    let stack = await this.getAssetPrice(_assetId, _paymentToken, _units);
    if (stack[0].eq(BigNumber.from(CurrencyType.ERC20))) {
      return {
        token: {
          tokenType: CurrencyType.ERC20,
          tokenAddress: _paymentToken,
        },
        value: stack[1],
      };
    }
    return {
      token: {
        tokenType: CurrencyType.ERC1155,
        tokenAddress: _paymentToken,
        tokenId: stack[1],
      },
      value: stack[2],
    };
  };

  public readonly checkAllowance = async (
    assetId: BigNumberish,
    prices: price[],
    units: BigNumberish,
    rain1155Address: string,
    signer: string
  ): Promise<allowance[]> => {
    let allowances: allowance[] = [];
    for (let i = 0; i < prices.length; i++) {
      let price = prices[i];
      if (price.token.tokenType === CurrencyType.ERC20) {
        let ERC20Contract = new ERC20(price.token.tokenAddress, this.signer);
        let amount = (
          await this.getPrice(assetId, price.token.tokenAddress, units)
        ).value;
        let allowed = await ERC20Contract.allowance(signer, rain1155Address);
        allowances.push({
          type: CurrencyType.ERC20,
          address: price.token.tokenAddress,
          allowed: allowed >= amount ? true : false,
          amount: allowed >= amount ? BigNumber.from(0) : amount.sub(allowed),
          name: await ERC20Contract.name(),
          symbol: await ERC20Contract.name(),
        });
      } else {
        let ERC1155Contract = new ERC1155(
          price.token.tokenAddress,
          this.signer
        );
        let erc1155Price = await this.getPrice(
          assetId,
          price.token.tokenAddress,
          units
        );
        let allowed = await ERC1155Contract.isApprovedForAll(
          signer,
          rain1155Address
        );
        let tokenURI: string;
        try {
          tokenURI = erc1155Price.token.tokenId
            ? await ERC1155Contract.uri(erc1155Price.token.tokenId)
            : '';
        } catch (error) {
          tokenURI = `TokenID ${erc1155Price.token.tokenId} may not exist now`;
        }
        allowances.push({
          type: CurrencyType.ERC1155,
          address: price.token.tokenAddress,
          allowed: allowed,
          amount: allowed ? BigNumber.from(0) : erc1155Price.value,
          tokenId: erc1155Price.token.tokenId,
          tokenURI: tokenURI,
        });
      }
    }

    return allowances;
  };

  public readonly assets: (
    arg0: BigNumberish,
    overrides?: ReadTxOverrides
  ) => Promise<AssetDetails>;

  public readonly balanceOf: (
    account: string,
    id: BigNumberish,
    overrides?: ReadTxOverrides
  ) => Promise<BigNumber>;

  public readonly balanceOfBatch: (
    accounts: string[],
    ids: BigNumberish[],
    overrides?: ReadTxOverrides
  ) => Promise<BigNumber[]>;

  public readonly canMint: (
    _assetId: BigNumberish,
    _account: string,
    overrides?: ReadTxOverrides
  ) => Promise<boolean>;

  public readonly createNewAsset: (
    _config: AssetConfig,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly getAssetPrice: (
    _assetId: BigNumberish,
    _paymentToken: string,
    _units: BigNumberish,
    overrides?: ReadTxOverrides
  ) => Promise<BigNumber[]>;

  public readonly isApprovedForAll: (
    account: string,
    operator: string,
    overrides?: ReadTxOverrides
  ) => Promise<boolean>;

  public readonly mintAssets: (
    _assetId: BigNumberish,
    _units: BigNumberish,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly safeBatchTransferFrom: (
    from: string,
    to: string,
    ids: BigNumberish[],
    amounts: BigNumberish[],
    data: BytesLike,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly safeTransferFrom: (
    from: string,
    to: string,
    id: BigNumberish,
    amount: BigNumberish,
    data: BytesLike,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly setApprovalForAll: (
    operator: string,
    approved: boolean,
    overrides?: TxOverrides
  ) => Promise<ContractTransaction>;

  public readonly supportsInterface: (
    interfaceId: BytesLike,
    overrides?: ReadTxOverrides
  ) => Promise<boolean>;

  public readonly totalAssets: (
    overrides?: ReadTxOverrides
  ) => Promise<BigNumber>;

  public readonly uri: (
    _tokenId: BigNumberish,
    overrides?: ReadTxOverrides
  ) => Promise<string>;
}

export type AssetDetails = {
  lootBoxId: BigNumber;
  id: BigNumber;
  vmStateConfig: StateConfigStruct;
  vmStatePointer: string;
  recipient: string;
  tokenURI: string;
};

export type AssetConfig = {
  name: string;
  description: string;
  lootBoxId: BigNumber;
  vmStateConfig: StateConfigStruct;
  currencies: string[];
  recipient: string;
  tokenURI: string;
};
