import { Logger } from '@ethersproject/logger';
import { version } from './_version';
import { StateConfigStruct } from './typechain/Rain1155';
import { BigNumber, BigNumberish } from 'ethers';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { condition, Conditions } from './rain1155';
import { AllStandardOps } from "rain-sdk";

const logger = new Logger(version);

export type VMState = StateConfigStruct;

export const eighteenZeros = '000000000000000000';
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';


// export enum AllStandardOps {
//   CONSTANT,
//   STACK,
//   CONTEXT,
//   STORAGE,
//   ZIPMAP,
//   DEBUG,
//   BLOCK_NUMBER,
//   BLOCK_TIMESTAMP,
//   SENDER,
//   THIS_ADDRESS,
//   SCALE18_MUL,
//   SCALE18_DIV,
//   SCALE18,
//   SCALEN,
//   SCALE_BY,
//   ADD,
//   SATURATING_ADD,
//   SUB,
//   SATURATING_SUB,
//   MUL,
//   SATURATING_MUL,
//   DIV,
//   MOD,
//   EXP,
//   MIN,
//   MAX,
//   ISZERO,
//   EAGER_IF,
//   EQUAL_TO,
//   LESS_THAN,
//   GREATER_THAN,
//   EVERY,
//   ANY,
//   REPORT,
//   SATURATING_DIFF,
//   UPDATE_BLOCKS_FOR_TIER_RANGE,
//   SELECT_LTE,
//   IERC20_BALANCE_OF,
//   IERC20_TOTAL_SUPPLY,
//   IERC721_BALANCE_OF,
//   IERC721_OWNER_OF,
//   IERC1155_BALANCE_OF,
//   IERC1155_BALANCE_OF_BATCH,
//   length,
// }

export const Opcode = {
  ...AllStandardOps,
};

export type Bytes = ArrayLike<number>;

export type BytesLike = Bytes | string;

export interface Hexable {
  toHexString(): string;
}

function isHexable(value: any): value is Hexable {
  return !!value.toHexString;
}

export function isHexString(value: any, length?: number): boolean {
  if (typeof value !== 'string' || !value.match(/^0x[0-9A-Fa-f]*$/)) {
    return false;
  }
  if (length && value.length !== 2 + 2 * length) {
    return false;
  }
  return true;
}

export type DataOptions = {
  allowMissingPrefix?: boolean;
  hexPad?: 'left' | 'right' | null;
};

const HexCharacters: string = '0123456789abcdef';

function isInteger(value: number) {
  return typeof value === 'number' && value % 1 === 0;
}

export function isBytes(value: any): value is Bytes {
  if (value == null) {
    return false;
  }

  if (value.constructor === Uint8Array) {
    return true;
  }
  if (typeof value === 'string') {
    return false;
  }
  if (!isInteger(value.length) || value.length < 0) {
    return false;
  }

  for (let i = 0; i < value.length; i++) {
    const v = value[i];
    if (!isInteger(v) || v < 0 || v >= 256) {
      return false;
    }
  }
  return true;
}

export function hexlify(
  value: BytesLike | Hexable | number | bigint,
  options?: DataOptions
): string {
  if (!options) {
    options = {};
  }

  if (typeof value === 'number') {
    logger.checkSafeUint53(value, 'invalid hexlify value');

    let hex = '';
    while (value) {
      hex = HexCharacters[value & 0xf] + hex;
      value = Math.floor(value / 16);
    }

    if (hex.length) {
      if (hex.length % 2) {
        hex = '0' + hex;
      }
      return '0x' + hex;
    }

    return '0x00';
  }

  if (typeof value === 'bigint') {
    value = value.toString(16);
    if (value.length % 2) {
      return '0x0' + value;
    }
    return '0x' + value;
  }

  if (
    options.allowMissingPrefix &&
    typeof value === 'string' &&
    value.substring(0, 2) !== '0x'
  ) {
    value = '0x' + value;
  }

  if (isHexable(value)) {
    return value.toHexString();
  }

  if (isHexString(value)) {
    if ((value as string).length % 2) {
      if (options.hexPad === 'left') {
        value = '0x0' + (value as string).substring(2);
      } else if (options.hexPad === 'right') {
        value += '0';
      } else {
        logger.throwArgumentError('hex data is odd-length', 'value', value);
      }
    }
    return (value as string).toLowerCase();
  }

  if (isBytes(value)) {
    let result = '0x';
    for (let i = 0; i < value.length; i++) {
      let v = value[i];
      result += HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f];
    }
    return result;
  }

  return logger.throwArgumentError('invalid hexlify value', 'value', value);
}

function addSlice(array: Uint8Array): Uint8Array {
  if (array.slice()) {
    return array;
  }

  // array.slice = function() {
  //   const args = Array.prototype.slice.call(arguments);
  //   return addSlice(new Uint8Array(Array.prototype.slice.apply(array, args)));
  // };

  return array;
}

export function arrayify(
  value: BytesLike | Hexable | number,
  options?: DataOptions
): Uint8Array {
  if (!options) {
    options = {};
  }

  if (typeof value === 'number') {
    logger.checkSafeUint53(value, 'invalid arrayify value');

    const result = [];
    while (value) {
      result.unshift(value & 0xff);
      value = parseInt(String(value / 256));
    }
    if (result.length === 0) {
      result.push(0);
    }

    return addSlice(new Uint8Array(result));
  }

  if (
    options.allowMissingPrefix &&
    typeof value === 'string' &&
    value.substring(0, 2) !== '0x'
  ) {
    value = '0x' + value;
  }

  if (isHexable(value)) {
    value = value.toHexString();
  }

  if (isHexString(value)) {
    let hex = (value as string).substring(2);
    if (hex.length % 2) {
      if (options.hexPad === 'left') {
        hex = '0' + hex;
      } else if (options.hexPad === 'right') {
        hex += '0';
      } else {
        logger.throwArgumentError('hex data is odd-length', 'value', value);
      }
    }

    const result = [];
    for (let i = 0; i < hex.length; i += 2) {
      result.push(parseInt(hex.substring(i, i + 2), 16));
    }

    return addSlice(new Uint8Array(result));
  }

  if (isBytes(value)) {
    return addSlice(new Uint8Array(value));
  }
  return logger.throwArgumentError('invalid arrayify value', 'value', value);
}

export function zeroPad(value: BytesLike, length: number): Uint8Array {
  value = arrayify(value);

  if (value.length > length) {
    logger.throwArgumentError('value out of range', 'value', arguments[0]);
  }

  const result = new Uint8Array(length);
  result.set(value, length - value.length);
  return addSlice(result);
}

export function bytify(
  value: number | BytesLike | Hexable,
  bytesLength = 1
): BytesLike {
  return zeroPad(hexlify(value), bytesLength);
}

export function concat(items: ReadonlyArray<BytesLike>): Uint8Array {
  const objects = items.map(item => arrayify(item));
  const length = objects.reduce((accum, item) => accum + item.length, 0);

  const result = new Uint8Array(length);

  objects.reduce((offset, object) => {
    result.set(object, offset);
    return offset + object.length;
  }, 0);

  return addSlice(result);
}

export function op(code: number, erand = 0): Uint8Array {
  return concat([bytify(code), bytify(erand)]);
}

export function BNtoInt(x: BigNumber): number {
  return parseInt(x._hex);
}

export const fetchFile = (_path: string): string => {
  try {
    return fs.readFileSync(_path).toString();
  } catch (error) {
    console.log(error);
    return '';
  }
};

export const writeFile = (_path: string, file: any): void => {
  try {
    fs.writeFileSync(_path, file);
  } catch (error) {
    console.log(error);
  }
};

export const exec = (cmd: string): string | Buffer => {
  const srcDir = path.join(__dirname, '..');
  try {
    return execSync(cmd, { cwd: srcDir, stdio: 'inherit' });
  } catch (e) {
    throw new Error(`Failed to run command \`${cmd}\``);
  }
};

/**
 * @param opcodes All opcodes as number[]
 * @param start start index to start matching from
 * @param size size of pattern to match with
 * @returns new_start index
 */
export const matchPattern = (
  opcodes: number[],
  start: number,
  size: number
): number => {
  const arr = opcodes.slice(start, opcodes.length); // take subarray from start index
  let patterns = getPattern(size); // get patterns of size length
  let next_start = start; // set nex_start to start to chjeck if opcodes matched or not
  patternLoop: for (let j = 0; j < patterns.length; j++) {
    // loop over all retrived patterns
    let pattern = patterns[j];
    for (let i = 0; i < size; i += 2) {
      if (arr[i] !== pattern[i]) {
        continue patternLoop; // if any opcode doesnot match goto pattern loop
      }
    } // pattern matched
    next_start = start + size; // update the next_start
    return next_start; //return new_start
  }
  return next_start; // retrun start
};

/**
 * List of all patterns
 */
const patterns = [
  [Opcode.CONSTANT, 0],
  [Opcode.BLOCK_NUMBER, 0, Opcode.CONSTANT, 0, Opcode.GREATER_THAN, 0],
  [
    Opcode.CONSTANT,
    0,
    Opcode.CONTEXT,
    0,
    Opcode.IERC20_BALANCE_OF,
    0,
    Opcode.CONSTANT,
    0,
    Opcode.GREATER_THAN,
    0,
  ],
  [
    Opcode.CONSTANT,
    0,
    Opcode.CONTEXT,
    0,
    Opcode.IERC721_BALANCE_OF,
    0,
    Opcode.CONSTANT,
    0,
    Opcode.GREATER_THAN,
    0,
  ],
  [
    Opcode.CONSTANT,
    0,
    Opcode.CONTEXT,
    0,
    Opcode.CONSTANT,
    0,
    Opcode.IERC1155_BALANCE_OF,
    0,
    Opcode.CONSTANT,
    0,
    Opcode.GREATER_THAN,
    0,
  ],
];

/**
 * @param size Length of pattern
 * @returns array of patterns
 */
const getPattern = (size: number): number[][] => {
  let pattern = [];
  for (let i = 0; i < patterns.length; i++) {
    if (patterns[i].length === size) {
      pattern.push(patterns[i]);
    }
  }
  return pattern;
};

/**
 * @param opcodes Opcode pattern
 * @param constants array of consttants
 * @returns condition object
 */
export const getCondition = (
  opcodes: number[],
  constants: BigNumberish[]
): condition => {
  if (opcodes.length === 2) {
    // None condition
    let condition: condition = {
      type: Conditions.NONE,
    };
    return condition;
  } else if (opcodes.length === 6) {
    // Block condition
    let condition: condition = {
      type: Conditions.BLOCK_NUMBER,
      blockNumber: parseInt(constants[opcodes[3]].toString()),
    };
    return condition;
  } else if (checkOpcode(opcodes, Opcode.IERC20_BALANCE_OF)) {
    // ERC20 Balance condition
    let condition: condition = {
      type: Conditions.ERC20BALANCE,
      address: constants[opcodes[1]].toString(),
      balance: BigNumber.from(constants[opcodes[7]]),
    };
    return condition;
  } else if (checkOpcode(opcodes, Opcode.IERC721_BALANCE_OF)) {
    // ERC721 Balance Condition
    let condition: condition = {
      type: Conditions.ERC721BALANCE,
      address: constants[opcodes[1]].toString(),
      balance: BigNumber.from(constants[opcodes[7]]),
    };
    return condition;
  } else if (checkOpcode(opcodes, Opcode.IERC1155_BALANCE_OF)) {
    // ERC1155 Balance Condition
    let condition: condition = {
      type: Conditions.ERC1155BALANCE,
      address: constants[opcodes[1]].toString(),
      id: BigNumber.from(constants[opcodes[5]]),
      balance: BigNumber.from(constants[opcodes[9]]),
    };
    return condition;
  }
  let condition: condition = {
    type: Conditions.NONE,
  };
  return condition;
};

export const patternLengths = (): number[] => {
  let lengths: number[] = [];
  for (let i = 0; i < patterns.length; i++) {
    let len = patterns[i].length;
    if (!lengths.includes(len)) lengths.push(len);
  }

  return lengths.sort(function(a, b) {
    return a - b;
  });
};

export const getCanMintConfig = (
  opcodes: number[],
  constants: BigNumberish[]
): condition[] => {
  let conditions: condition[] = [];
  let len = opcodes.length;
  let start = 0; // Start index to start matching the pattern
  let patterns = patternLengths(); // get lengths of all patternsa
  while (len > 0) {
    // repet untill opcod length becomes 0
    for (let j = patterns.length - 1; j >= 0; j--) {
      // loop over all diff pattern length
      if (opcodes.length >= patterns[j]) {
        const new_start = matchPattern(
          // get the matching pattern
          opcodes, // opcodes
          start, // start Index
          patterns[j] // size of pattern
        );
        if (new_start !== start) {
          console.log("Matched patterns : ", opcodes.slice(start, new_start))
          // update the start and len only if new_start != start
          conditions.push(
            getCondition(opcodes.slice(start, new_start), constants)
          ); // get the condition and push it in array.
          start = new_start;
          len = len - patterns[j];
          break; // break the forloop so next pattern can start from max size.
        }
      }
    }
  }
  return conditions;
};

const checkOpcode = (opcodes: number[], opcode: number): boolean => {
  let stripedOpcodes: number[] = [];
  for(let i=0;i<opcodes.length; i+=2){
    stripedOpcodes.push(opcodes[i]);
  }
  return (stripedOpcodes.includes(opcode))
}
