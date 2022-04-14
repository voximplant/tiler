import {VoxTilerGridDefinition} from "./VoxTilerGridDefinition";

interface VoxTilerDrawArea {
  priority: number;
  width: number;
  height: number;
  top: number;
  left: number;
  overflow?: 'none' | 'next' | number,
  grid: VoxTilerGridDefinition[]
}

export {VoxTilerDrawArea};