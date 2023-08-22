import { VoxTilerOptions } from './VoxTilerOptions';
import { VoxTilerDrawArea } from './VoxTilerDrawArea';
import { VoxTilerGridDefinition } from './VoxTilerGridDefinition';

export function makeId(length: number): string {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function numberOrZero(input: unknown): number {
  if (isNumber(input)) {
    return input as number;
  }
  return 0;
}

function isNumber(item: unknown): boolean {
  return typeof item === 'number' && !isNaN(item);
}

export function generateMargins(marginOrigin?: number | number[]): [number, number] {
  if (Array.isArray(marginOrigin)) {
    switch (marginOrigin.length) {
      case 0:
        return [0, 0];
      case 1:
        return [numberOrZero(marginOrigin[0]), numberOrZero(marginOrigin[0])];
      default:
        return [numberOrZero(marginOrigin[0]), numberOrZero(marginOrigin[1])];
    }
  } else {
    if (marginOrigin) {
      return [numberOrZero(marginOrigin), numberOrZero(marginOrigin)];
    } else {
      return [0, 0];
    }
  }
}

export function validateLayoutOptions(layoutOptions: VoxTilerOptions): void {
  if (typeof layoutOptions === 'undefined') {
    throw TypeError('layoutOptions is not set');
  }
  if (!isNumber(layoutOptions.width) || layoutOptions.width <= 0) {
    throw TypeError('layoutOptions.width is not a positive number');
  }
  if (!isNumber(layoutOptions.height) || layoutOptions.height <= 0) {
    throw TypeError('layoutOptions.height is not a positive number');
  }
  if (!layoutOptions.areas || !Array.isArray(layoutOptions.areas) || !layoutOptions.areas.length) {
    throw TypeError('layoutOptions.area have no items. At least one is required.');
  }
  const prioritySet = new Set<number>();
  layoutOptions.areas.forEach((area, index) => {
    validateLayoutArea(area, index);
    if (prioritySet.has(area.priority)) {
      throw TypeError(`layoutOptions.area[${index}].priority === ${area.priority} already in use`);
    }
    prioritySet.add(area.priority);
  });
  prioritySet.clear();
}

function validateLayoutArea(area: VoxTilerDrawArea, index: number): void {
  if (!isNumber(area.priority)) {
    throw TypeError(`layoutOptions.area[${index}].priority is not a number`);
  }
  if (!isNumber(area.width) || area.width <= 0) {
    throw TypeError(`layoutOptions.area[${index}].width is not a positive number`);
  }
  if (!isNumber(area.height) || area.height <= 0) {
    throw TypeError(`layoutOptions.area[${index}].height is not a positive number`);
  }
  if (!isNumber(area.top)) {
    throw TypeError(`layoutOptions.area[${index}].top is not a number`);
  }
  if (!isNumber(area.left)) {
    throw TypeError(`layoutOptions.area[${index}].left is not a number`);
  }
  if (!area.grid || !area.grid.length || !Array.isArray(area.grid)) {
    throw TypeError(`layoutOptions.area[${index}].grid have no items. At least one is required.`);
  }
  area.grid.forEach((grid, idx) => validateLayoutGrid(grid, idx, index));
}

function validateLayoutGrid(grid: VoxTilerGridDefinition, index: number, areaIndex: number): void {
  if (!isNumber(grid.fromCount) || grid.fromCount <= 0) {
    throw TypeError(
      `layoutOptions.area[${areaIndex}].grid[${index}].fromCount is not a positive number`
    );
  }
  if (!isNumber(grid.toCount) || grid.toCount <= 0) {
    throw TypeError(
      `layoutOptions.area[${areaIndex}].grid[${index}].toCount is not a positive number`
    );
  }
  if (!isNumber(grid.colCount) || grid.colCount <= 0) {
    throw TypeError(
      `layoutOptions.area[${areaIndex}].grid[${index}].colCount is not a positive number`
    );
  }
  if (!isNumber(grid.rowCount) || grid.rowCount <= 0) {
    throw TypeError(
      `layoutOptions.area[${areaIndex}].grid[${index}].rowCount is not a positive number`
    );
  }
}

function getRoundPixel(lengthWithoutMargins: number, socket: number, itemCount: number) {
  const roundPixels = lengthWithoutMargins - socket * itemCount;
  return (roundPixels / HALF) | 0;
}

function getLengthWithoutMargins(length: number, margin: number, itemCount: number) {
  return length - margin * (itemCount + 1);
}

export function calculateSocketLinearSize(
  length: number,
  margin: number,
  itemCount: number
): [number, number] {
  const lengthWithoutMargins = getLengthWithoutMargins(length, margin, itemCount);
  const socket = (lengthWithoutMargins / itemCount) | 0;
  const hRoundPixel = getRoundPixel(lengthWithoutMargins, socket, itemCount);
  return [socket, hRoundPixel];
}

export function fixSocketAspectRatio(
  [sWidth, lRoundPixel]: [number, number],
  [sHeight, tRoundPixel]: [number, number],
  { forceAspectRatio, colCount, rowCount }: VoxTilerGridDefinition,
  { width, height }: VoxTilerDrawArea,
  margins: [number, number]
): [number, number, number, number] {
  if (!forceAspectRatio || sWidth / sHeight === forceAspectRatio) {
    return [sWidth, sHeight, lRoundPixel, tRoundPixel];
  }
  if (sWidth / sHeight > forceAspectRatio) {
    const lengthWithoutMargins = getLengthWithoutMargins(width, margins[0], colCount);
    const newWidth = (sHeight * forceAspectRatio) | 0;
    const newLRoundPixel = getRoundPixel(lengthWithoutMargins, newWidth, colCount);
    console.error([newWidth, sHeight, newLRoundPixel, tRoundPixel], sHeight, forceAspectRatio);
    return [newWidth, sHeight, newLRoundPixel, tRoundPixel];
  } else {
    const lengthWithoutMargins = getLengthWithoutMargins(height, margins[1], rowCount);
    const newHeight = (sWidth / forceAspectRatio) | 0;
    const newTRoundPixel = getRoundPixel(lengthWithoutMargins, newHeight, rowCount);
    console.error([sWidth, newHeight, lRoundPixel, newTRoundPixel], sWidth, forceAspectRatio);
    return [sWidth, newHeight, lRoundPixel, newTRoundPixel];
  }
}

export const HALF = 2;
