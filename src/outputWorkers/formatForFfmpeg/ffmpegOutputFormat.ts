import { StreamDescription } from './streamDescription';
import { RectangleDescription } from './rectangleDescription';
import { LabelDescription } from './labelDescription';

export interface FfmpegOutputFormat {
  streams: {
    [id: string]: StreamDescription;
  };
  rectangles?: RectangleDescription[];
  labels?: LabelDescription[];
}
