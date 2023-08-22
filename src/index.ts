import { FfmpegOutputFormat } from './outputWorkers/formatForFfmpeg/ffmpegOutputFormat';
import { VoxTilerDrawArea } from './VoxTilerDrawArea';
import { VoxTilerGridDefinition } from './VoxTilerGridDefinition';
import { VoxTilerInput } from './VoxTilerInput';
import { VoxTilerObjectFit } from './VoxTilerObjectFit';
import { VoxTilerPosition } from './VoxTilerPosition';
import { TilerWorker } from './TilerWorker';
import { validateLayoutOptions } from './utils';
import { VoxTilerOptions } from './VoxTilerOptions';
import { generateFfmpegRaster } from './outputWorkers/formatForFfmpeg/formatForFfmpeg';

function createTiler(layoutOptions: VoxTilerOptions): TilerWorker {
  validateLayoutOptions(layoutOptions);
  // sort areas
  layoutOptions.areas.sort((a, b) => a.priority - b.priority);
  return new TilerWorker(layoutOptions);
}

export {
  createTiler,
  VoxTilerOptions,
  VoxTilerInput,
  VoxTilerGridDefinition,
  VoxTilerObjectFit,
  VoxTilerPosition,
  VoxTilerDrawArea,
  FfmpegOutputFormat,
  TilerWorker,
  generateFfmpegRaster,
};
