import { Logger } from '@ethersproject/logger';
import { version } from './_version';
import { StateConfigStruct } from './typechain/Rain1155';
import { BigNumber, BigNumberish } from 'ethers';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { AllStandardOps } from 'rain-sdk';
import { condition } from './rain1155';

const logger = new Logger(version);

export type VMState = StateConfigStruct;

export const eighteenZeros = '000000000000000000';
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export enum Type {
  ERC20,
  ERC1155,
}

export enum Conditions {
  NONE,
  BLOCK_NUMBER,
  BALANCE_TIER,
  ERC20BALANCE,
  ERC721BALANCE,
  ERC1155BALANCE,
}

enum GameAssetsOpcode {
  REPORT_AT_BLOCK = 0 + AllStandardOps.length,
  ACCOUNT,
}
export const Opcode = {
  ...AllStandardOps,
  ...GameAssetsOpcode,
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

export const matchPattern = (
  opcodes: number[],
  start: number,
  size: number
): [number, number[]] => {
  const arr = opcodes.slice(start, opcodes.length);
  let patterns = getPattern(size);
  let next_start = start;
  patternLoop: for (let j = 0; j < patterns.length; j++) {
    let pattern = patterns[j];
    for (let i = 0; i < size; i += 2) {
      if (arr[i] !== pattern[i]) {
        continue patternLoop;
      }
    }
    next_start = start + size;
    return [next_start, pattern];
  }
  return [next_start, []];
};

const patterns_2 = [[Opcode.VAL, 0]];
const patterns_6 = [
  [Opcode.BLOCK_NUMBER, 0, Opcode.VAL, 0, Opcode.GREATER_THAN, 0],
];
const patterns_10 = [
  [
    Opcode.VAL,
    0,
    Opcode.ACCOUNT,
    0,
    Opcode.IERC20_BALANCE_OF,
    0,
    Opcode.VAL,
    0,
    Opcode.GREATER_THAN,
    0,
  ],
  [
    Opcode.VAL,
    0,
    Opcode.ACCOUNT,
    0,
    Opcode.IERC721_BALANCE_OF,
    0,
    Opcode.VAL,
    0,
    Opcode.GREATER_THAN,
    0,
  ],
];
const patterns_12 = [
  [
    Opcode.VAL,
    0,
    Opcode.ACCOUNT,
    0,
    Opcode.VAL,
    0,
    Opcode.IERC1155_BALANCE_OF,
    0,
    Opcode.VAL,
    0,
    Opcode.GREATER_THAN,
    0,
  ],
];

const patterns_14 = [
  [
    Opcode.VAL,
    0,
    Opcode.ACCOUNT,
    0,
    Opcode.REPORT,
    0,
    Opcode.BLOCK_NUMBER,
    0,
    Opcode.REPORT_AT_BLOCK,
    0,
    Opcode.VAL,
    0,
    Opcode.GREATER_THAN,
    0,
  ],
];

const patterns = [
  ...patterns_2,
  ...patterns_6,
  ...patterns_10,
  ...patterns_12,
  ...patterns_14,
];

const getPattern = (size: number): number[][] => {
  let pattern = [];
  for (let i = 0; i < patterns.length; i++) {
    if (patterns[i].length === size) {
      pattern.push(patterns[i]);
    }
  }
  return pattern;
};

export const getCondition = (
  opcodes: number[],
  constants: BigNumberish[]
): condition => {
  if (opcodes.length === 2) {
    let condition: condition = {
      type: Conditions.NONE,
    };
    return condition;
  } else if (opcodes.length === 6) {
    let condition: condition = {
      type: Conditions.BLOCK_NUMBER,
      blockNumber: parseInt(constants[opcodes[3]].toString()),
    };
    return condition;
  } else if (opcodes.includes(Opcode.IERC20_BALANCE_OF)) {
    let condition: condition = {
      type: Conditions.ERC20BALANCE,
      address: constants[opcodes[1]].toString(),
      balance: BigNumber.from(constants[opcodes[7]]),
    };
    return condition;
  } else if (opcodes.includes(Opcode.IERC721_BALANCE_OF)) {
    let condition: condition = {
      type: Conditions.ERC721BALANCE,
      address: constants[opcodes[1]].toString(),
      balance: BigNumber.from(constants[opcodes[7]]),
    };
    return condition;
  } else if (opcodes.includes(Opcode.IERC1155_BALANCE_OF)) {
    let condition: condition = {
      type: Conditions.ERC1155BALANCE,
      address: constants[opcodes[1]].toString(),
      id: BigNumber.from(constants[opcodes[5]]),
      balance: BigNumber.from(constants[opcodes[9]]),
    };
    return condition;
  } else if (opcodes.includes(Opcode.REPORT_AT_BLOCK)) {
    let condition: condition = {
      type: Conditions.BALANCE_TIER,
      tierAddress: constants[opcodes[1]].toString(),
      tierCondition: parseInt(constants[opcodes[11]].toString()),
    };
    return condition;
  }
  let condition: condition = {
    type: Conditions.NONE,
  };
  return condition;
};

export const patternLengths = [2, 6, 10, 12, 14];
