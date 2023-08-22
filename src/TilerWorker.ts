import { formatForWeb } from './outputWorkers/formatForWeb';
import { formatForFfmpeg } from './outputWorkers/formatForFfmpeg/formatForFfmpeg';
import {
  calculateSocketLinearSize,
  fixSocketAspectRatio,
  generateMargins,
  HALF,
  makeId,
} from './utils';
import { VoxTilerOptions } from './VoxTilerOptions';
import { VoxTilerDrawArea } from './VoxTilerDrawArea';
import { VoxTilerGridDefinition } from './VoxTilerGridDefinition';
import { SocketPosition } from './SocketPosition';
import { RawOutput } from './RawOutput';
import { VoxTilerInput } from './VoxTilerInput';

interface HashedAreasDescription {
  max: number;
  area: VoxTilerDrawArea;
  overflow?: number;
}

type AreaHash = Record<number, HashedAreasDescription>;

const OBJECT_SEED_SIZE = 8;

class TilerWorker {
  private readonly areaHash: AreaHash;
  private readonly defaultArea: number;
  private readonly seed: string;

  constructor(private readonly settings: VoxTilerOptions) {
    this.areaHash = this.hashAreas();
    this.defaultArea = settings.areas[settings.areas.length - 1].priority;
    this.seed = makeId(OBJECT_SEED_SIZE);
    if (!this.settings.logger) {
      this.settings.logger = console.log;
    }
    this.log(this.settings);
  }

  private log(...params: unknown[]) {
    if (this.settings.debug && this.settings.logger) {
      this.settings.logger.apply(this, [`[VoxTiler_${this.seed}]`, ...params]);
    }
  }

  private hashAreas(): AreaHash {
    return this.settings.areas.reduce<AreaHash>((acc, area, index): AreaHash => {
      const max = area.grid.reduce<number>((maxAcc, item): number => {
        if (!item.toCount) {
          return Number.MAX_VALUE;
        }
        if (maxAcc < item.toCount) {
          return item.toCount;
        }
        return maxAcc;
      }, 0);
      const hash: HashedAreasDescription = { max, area };
      if (
        area.overflow &&
        area.overflow === 'next' &&
        typeof this.settings.areas[index + 1] !== 'undefined'
      ) {
        hash.overflow = this.settings.areas[index + 1].priority; // Check if next exists
      } else if (typeof area.overflow === 'number') {
        hash.overflow = area.overflow; // only set numbers
      } else {
        // No overflow in this case
      }
      acc[area.priority] = hash;
      return acc;
    }, {});
  }

  private getGrid(area: number, count: number): VoxTilerGridDefinition {
    const areaSets = this.areaHash[area];
    const resultGrid = areaSets.area.grid.find(
      (grid) => grid.fromCount <= count && (!grid.toCount || grid.toCount >= count)
    );
    if (!resultGrid) {
      this.log("WARN: Can't found rule for", count, 'stream(s) in area', area, 'use last one');
      return areaSets.area.grid[areaSets.area.grid.length - 1];
    }
    return { ...resultGrid };
  }

  private separateInputByAreas(input: VoxTilerInput[]): Record<number, VoxTilerInput[]> {
    return input.reduce<Record<number, VoxTilerInput[]>>(
      (acc, item): Record<number, VoxTilerInput[]> => {
        this.log('Place stream with id', item.id);
        let cArea = item.area;
        if (typeof cArea === 'undefined' || !this.areaHash[cArea]) {
          this.log(`[${item.id}]`, 'Area unknown. set to default', this.defaultArea);
          cArea = this.defaultArea; //area wasn't declared move to default;
        }
        const checkOverflowRecurrent = (area: number): number => {
          const max = this.areaHash[area].max;
          if (typeof acc[area] === 'undefined' || acc[area].length < max) {
            this.log(`[${item.id}]`, 'Area have some place. Place to area', area);
            return area;
          }
          const overflow = this.areaHash[area].overflow;
          if (typeof overflow !== 'undefined' && this.areaHash[overflow]) {
            this.log(
              `[${item.id}]`,
              'Area',
              area,
              'is full but can be overflow to area ',
              this.areaHash[area].overflow
            );
            return checkOverflowRecurrent(overflow);
          }
          return -1;
        };
        cArea = checkOverflowRecurrent(cArea);
        if (cArea !== -1) {
          this.log(`[${item.id}]`, 'Area selected:', cArea);
          if (!acc[cArea]) {
            acc[cArea] = [];
          }
          acc[cArea].push(item);
        } else {
          this.log(`[${item.id}]`, 'WARN! Area not found. Drop stream');
        }
        return acc;
      },
      {}
    );
  }

  private generateSockets(areaId: number, streamsCount: number): SocketPosition[] {
    const grid = this.getGrid(areaId, streamsCount);
    const area = this.areaHash[areaId].area;
    if (typeof grid.centerLast === 'undefined') {
      grid.centerLast = true;
    }
    this.log(`Sockets for ${streamsCount} stream(s) by grid rules:`, grid);
    const margins = generateMargins(grid.margin);
    this.log(`Margins for ${areaId} is [${margins.join(',')}]`);
    const rawWidth = calculateSocketLinearSize(area.width, margins[0], grid.colCount);
    const rawHeight = calculateSocketLinearSize(area.height, margins[1], grid.rowCount);
    const [width, height, lRoundPixel, tRoundPixel] = fixSocketAspectRatio(
      rawWidth,
      rawHeight,
      grid,
      area,
      margins
    );
    this.log(
      `Socket data: area [${area.width},${area.height}] socket [${width},${height}] round:[${lRoundPixel},${tRoundPixel}]`
    );
    grid.rowCount = Math.ceil(streamsCount / grid.colCount);
    const sockets: SocketPosition[] = [];
    let lastRowOffset = 0;
    if (grid.toCount !== streamsCount && grid.centerLast) {
      const deltaCount = grid.colCount * grid.rowCount - streamsCount;
      lastRowOffset = ((deltaCount * width + deltaCount * margins[0]) / HALF) | 0;
    }
    for (let row = 0; row < grid.rowCount; row++) {
      const top = area.top + row * height + (row + 1) * margins[1] + tRoundPixel;
      const rowOffset = row === grid.rowCount - 1 ? lastRowOffset : 0;
      for (let col = 0; col < grid.colCount; col++) {
        const left = area.left + col * width + (col + 1) * margins[0] + rowOffset + lRoundPixel;
        if (sockets.length < streamsCount) {
          this.log(`Calculate row:${row} col:${col} [${left},${top}]`);
          sockets.push({ height, width, top, left });
        } else {
          this.log(`Empty slot skipped`);
        }
      }
    }
    if (this.settings.direction === 'rtl') {
      this.log('Flip sockets horizontally for rtl support');
    }
    return sockets;
  }

  private generateOutput(sockets: SocketPosition[], streams: VoxTilerInput[]): RawOutput[] {
    return sockets.map<RawOutput>((socket, idx) => {
      const stream = streams[idx];
      return { ...socket, stream };
    });
  }

  private formatOutput(rawOutput: RawOutput[]) {
    const outputFormat = this.settings.outputFormat || 'web';
    this.log(`=====Format raw output for ${outputFormat}===`);
    this.log('Raw output', JSON.stringify(rawOutput));
    switch (outputFormat) {
      case 'web':
        return formatForWeb(rawOutput);
      case 'ffmpeg':
        return formatForFfmpeg(rawOutput);
      default:
        this.log('Unknown output format type. Return raw output');
        return rawOutput;
    }
  }

  compose(input: VoxTilerInput[]): unknown {
    this.log('===Separate streams to areas===');
    const placeCandidates = this.separateInputByAreas(input);
    this.log('=======Separation result=======');
    this.log(placeCandidates);
    let areaOutputs: RawOutput[] = [];
    Object.entries(placeCandidates).forEach(([areaId, areaInput]) => {
      this.log(`==Generate sockets for area ${areaId}==`);
      const intAreaId = parseInt(areaId);
      const sockets = this.generateSockets(intAreaId, areaInput.length);
      areaOutputs = [...areaOutputs, ...this.generateOutput(sockets, areaInput)];
    });
    return this.formatOutput(areaOutputs);
  }
}

export { TilerWorker };
