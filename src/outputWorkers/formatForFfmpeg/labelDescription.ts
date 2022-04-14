import {FfmpegPositionCoords} from "./ffmpegPositionCoords";

export interface LabelDescription extends FfmpegPositionCoords {
  z: number,
  text: string,
  color: string,
  font?: string,
  size: number
  text_h?: number,
  text_w?: number,
  x: number,
  y: number,
  border?: {
    width: number
    color: string
  },
  background?: {
    color: string
  },
  shadow?: {
    x: number
    y: number
    color: string
  }

}