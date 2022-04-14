import {VoxTilerObjectFit} from "./VoxTilerObjectFit";
import {VoxTilerPosition} from "./VoxTilerPosition";

interface VoxTilerInput {
  id: string;
  baseWidth?: number;
  baseHeight?: number;
  objectFit?: VoxTilerObjectFit;
  area?: number,
  title?: VoxTilerTitleInput;
  vad?: {
    thickness: number,
    color: string,
  }
}
interface VoxTilerTitleInput{
  label: string;
  padding?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  margin?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  position: VoxTilerPosition;
  background: string;
  color: string;
  width: number,
  height: number
}

export {VoxTilerInput,VoxTilerTitleInput}