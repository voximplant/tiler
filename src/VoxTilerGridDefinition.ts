interface VoxTilerGridDefinition {
  fromCount: number;
  toCount: number;
  colCount: number;
  rowCount: number;
  margin?: number | number[];
  centerLast?: boolean;
  forceAspectRatio?: number;
}

export { VoxTilerGridDefinition };
