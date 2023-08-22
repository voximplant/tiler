import { FfmpegPositionCoords } from './ffmpegPositionCoords';

export interface RectangleDescription extends FfmpegPositionCoords {
  z: number;
  color: string;
  fill?: boolean;
  thickness: number;
}
