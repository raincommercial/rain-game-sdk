import { VM, StateConfig, BetweenTimestamps, AssetOp } from 'rain-sdk';
import { concat, op } from '../utils';
import { BigNumber, BigNumberish } from 'ethers';
import { ScriptError } from '../utils';
/**
 * enum for type of payment currency
 */
export enum CurrencyType {
  /**
   * for native token
   */
  NATIVE,
  /**
   * for ERC20 TOkens
   */
  ERC20,
  /**
   * for ERC1155  Tokens
   */
  ERC1155,
}

/**
 * enum for different types of conditions
 */
export enum ConditionType {
  /**
   * for no condition
   */
  NONE,
  /**
   * for current time in between start_time and end_time
   */
  TIME_IN_BETWEEN,
  /**
   * for current time is greater than start_time
   */
  TIME_AFTER,
  /**
   * for current time is less than than end_time
   */
  TIME_BEFORE,
  /**
   * same as TIME_IN_BETWEEN but for days
   */
  DAYS_FROM_TODAY,
  /**
   * for ERC20 token balance less than given number
   */
  LT_ERC20,
  /**
   * for ERC20 token balance greater than given number
   */
  GT_ERC20,
  /**
   * for ERC20 token equal to given number
   */
  EQ_ERC20,
}

/**
 * enum for denoting the type of conditionObject
 */
export enum RuleType {
  /**
   * for condition conditionObject
   */
  CONDITION,
  /**
   * for operator conditionObject
   */
  OPERATOR,
}

/**
 * enum for type of condiftion objects operator type
 */
export enum OperatorType {
  /**
   * for ANY opcode operator
   */
  OR,
  /**
   * for EVERY opcode operator
   */
  AND,
}

/**
 * interface for token used in price interface
 */
export interface token {
  tokenType: number;
  tokenAddress: string;
  tokenId?: BigNumberish;
}

/**
 * interface for price
 */
export interface price {
  /**
   * token interface
   */
  token: token;
  /**
   * amount to be paid
   */
  value: BigNumber;
}

/**
 * interface for conditionObject
 */
export interface condition {
  /**
   * type of condition from ConditionTYpe enum
   */
  conditionType: number;
  /**
   * optional parameter for other conditions
   */
  blockNumber?: number;
  tierCondition?: number;
  contractAddress?: string;
  value?: BigNumber;
  tokenId?: BigNumber;
  startTimestamp?: number;
  endTimestamp?: number;
}

export type allowance = {
  type: number;
  address: string;
  allowed: boolean;
  amount?: BigNumber;
  tokenId?: BigNumberish;
  tokenURI?: string;
  name?: string;
  symbol?: string;
};

/**
 * interface for conditions
 */
export interface conditionObject {
  /**
   * rule type from enum RuleType
   * Condition OR Operator
   */
  type: RuleType;
  /**
   * operator type
   * AND or OR
   */
  operator?: OperatorType;
  /**
   * childrens if RuleType is Operator
   */
  children?: conditionObject[];
  /**
   * childrens if RuleType is Condition
   */
  condition?: condition;
}

export class RuleGenerator {
  /**
   * ConditionType.NONE
   */
  public static generateNoneState(): StateConfig {
    const script: StateConfig = {
      constants: [1],
      sources: [concat([op(VM.Opcodes.CONSTANT, 0)])],
    };

    return script;
  }

  /**
   * ConditionType.TIME_IN_BETWEEN
   */
  public static generateInBetweenTimeState(
    startTimestamp: number,
    endTimestamp: number
  ): StateConfig {
    return new BetweenTimestamps(startTimestamp, endTimestamp);
  }

  /**
   * ConditionType.TIME_AFTER
   */
  public static generateAfterTimeState(timestamp: number): StateConfig {
    return VM.beforeAfterTime(timestamp, "lt")
  }

  /**
   * ConditionType.TIME_BEFORE
   */
  public static generateBeforeTimeState(timestamp: number): StateConfig {
    return VM.beforeAfterTime(timestamp, "gt")
  }

  /**
   * ConditionType.DAYS_FROM_TODAY
   */
  // There would need to be some logic that updates the final script at the point of deployment
  // public static generateDaysFromTodayState(): StateConfig {}

  /**
   * ConditionType.LT_ERC20
   * ConditionType.GT_ERC20
   * ConditionType.EQ_ERC20
   */
  public static generateERC20State(
    address: string,
    amount: BigNumber,
    type: number
  ): StateConfig {
    let error = new ScriptError('Invalid Script parameters.');
    if (type == ConditionType.EQ_ERC20) {
      return {
        sources: [
          concat([
            op(VM.Opcodes.CONSTANT, 0),
            op(VM.Opcodes.CONTEXT, 0),
            op(VM.Opcodes.IERC20_BALANCE_OF),
            op(VM.Opcodes.CONSTANT, 1),
            op(VM.Opcodes.EQUAL_TO),
          ]),
        ],
        constants: [address, amount],
      };
    } else if (type == ConditionType.LT_ERC20) {
      return {
        sources: [
          concat([
            op(VM.Opcodes.CONSTANT, 0),
            op(VM.Opcodes.CONTEXT, 0),
            op(VM.Opcodes.IERC20_BALANCE_OF),
            op(VM.Opcodes.CONSTANT, 1),
            op(VM.Opcodes.LESS_THAN),
          ]),
        ],
        constants: [address, amount],
      };
    } else if (type == ConditionType.GT_ERC20) {
      // return {
      //   sources: [
      //     concat([
      //       op(VM.Opcodes.CONSTANT, 0),
      //       op(VM.Opcodes.CONTEXT, 0),
      //       op(VM.Opcodes.IERC20_BALANCE_OF),
      //       op(VM.Opcodes.CONSTANT, 1),
      //       op(VM.Opcodes.GREATER_THAN),
      //     ]),
      //   ],
      //   constants: [address, amount],
      // };
      return VM.gte(
        new AssetOp("erc20-balance-of", [address]),
        VM.constant(amount) 
      )
    } else {
      throw error.error('Invalid type', '');
    }
    return {
      sources: [],
      constants: [],
    };
  }

  /**
   * OperatorType.OR
   */
  public static generateORState(n: number): StateConfig {
    // VM.or
    return {
      sources: [concat([op(VM.Opcodes.ANY, n)])],
      constants: [],
    };
  }

  /**
   * OperatorType.AND
   */
  public static generateANDState(n: number): StateConfig {
    // VM.and
    return {
      sources: [concat([op(VM.Opcodes.EVERY, n)])],
      constants: [],
    };
  }
}
