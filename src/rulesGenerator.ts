import { VM, StateConfig, SaleDurationInTimestamp } from 'rain-sdk';
import { concat, op } from './utils';
import { BigNumber } from 'ethers';
import { ScriptError } from './utils';
import { ConditionType } from './rain1155';

/**
 * ConditionType.NONE
 */
export function generateNoneState(): StateConfig {
  const script: StateConfig = {
    constants: [1],
    sources: [concat([op(VM.Opcodes.CONSTANT, 0)])],
  };

  return script;
}

/**
 * ConditionType.TIME_IN_BETWEEN
 */
export function generateInBetweenTimeState(
  startTimestamp: number,
  endTimestamp: number
): StateConfig {
  return new SaleDurationInTimestamp(startTimestamp, endTimestamp);
}

/**
 * ConditionType.TIME_AFTER
 */
export function generateAfterTimeState(timestamp: number): StateConfig {
  const script: StateConfig = {
    constants: [timestamp],
    sources: [
      concat([
        op(VM.Opcodes.BLOCK_TIMESTAMP),
        op(VM.Opcodes.CONSTANT, 0),
        op(VM.Opcodes.GREATER_THAN),
      ]),
    ],
  };

  return script;
}

/**
 * ConditionType.TIME_BEFORE
 */
export function generateBeforeTimeState(timestamp: number): StateConfig {
  const script: StateConfig = {
    constants: [timestamp],
    sources: [
      concat([
        op(VM.Opcodes.BLOCK_TIMESTAMP),
        op(VM.Opcodes.CONSTANT, 0),
        op(VM.Opcodes.LESS_THAN),
      ]),
    ],
  };

  return script;
}

/**
 * ConditionType.DAYS_FROM_TODAY
 */
// There would need to be some logic that updates the final script at the point of deployment
// export function generateDaysFromTodayState(): StateConfig {}

/**
 * ConditionType.LT_ERC20
 * ConditionType.GT_ERC20
 * ConditionType.EQ_ERC20
 */
export function generateERC20State(
  address: string,
  amount: BigNumber,
  type: number
): StateConfig {
    let error = new ScriptError("Invalid Script parameters.");
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
    return {
        sources: [
          concat([
            op(VM.Opcodes.CONSTANT, 0),
            op(VM.Opcodes.CONTEXT, 0),
            op(VM.Opcodes.IERC20_BALANCE_OF),
            op(VM.Opcodes.CONSTANT, 1),
            op(VM.Opcodes.GREATER_THAN),
          ]),
        ],
        constants: [address, amount],
      };
  }
  else{
    throw error.error("Invalid type", "");
  }
  return ({
    sources: [],
    constants: []
  });
}

/**
 * OperatorType.OR
 */
export function generateORState(n: number): StateConfig {
  return {
    sources: [concat([op(VM.Opcodes.ANY, n)])],
    constants: [],
  };
}


/**
 * OperatorType.AND
 */
export function generateANDState(n: number): StateConfig {
  return {
    sources: [concat([op(VM.Opcodes.EVERY, n)])],
    constants: [],
  };
}
