import {FfmpegPositionCoords} from "./ffmpegPositionCoords";

export interface StreamDescription {
  z: number,
  target: FfmpegPositionCoords,
  source: FfmpegPositionCoords
}