import {VoxTilerDrawArea} from "./VoxTilerDrawArea";

interface VoxTilerOptions {
  width: number;
  height: number;
  outputFormat: 'web' | 'ffmpeg';
  direction?: 'ltr' | 'rtl';
  areas: VoxTilerDrawArea[];
  debug?: boolean;
  logger?: typeof console.log;
}

export {VoxTilerOptions};