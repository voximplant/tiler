import {HALF} from "../../utils";
import {FfmpegPositionCoords} from "./ffmpegPositionCoords";
import {StreamDescription} from "./streamDescription";
import {RectangleDescription} from "./rectangleDescription";
import {FfmpegOutputFormat} from "./ffmpegOutputFormat";
import {RawOutput} from "../../RawOutput";
import {VoxTilerObjectFit} from "../../VoxTilerObjectFit";
import {LabelDescription} from "./labelDescription";
import {VoxTilerTitleInput} from "../../VoxTilerInput";

interface BoxParams {
  width: number,
  height: number,
  top: number,
  left: number
}

interface OriginParams {
  width: number,
  height: number
}

interface ScaleOriginToBoxParams {
  objectFit?: VoxTilerObjectFit,
  box: BoxParams,
  origin: OriginParams
}

type ScaleSourceActor = (data: Omit<ScaleOriginToBoxParams, 'objectFit'>) => FfmpegPositionCoords;

/**
 * contain strategy
 * @param box
 * @param origin
 */
const containScaleSource: ScaleSourceActor = function ({origin}) {
  return {w: origin.width, h: origin.height, x: 0, y: 0};
}

const coverScaleSource: ScaleSourceActor = function ({box, origin}) {
  const boxScale = box.height / box.width;
  const originScale = origin.height / origin.width
  if (boxScale < originScale) {
    const w = origin.width;
    const h = (origin.width * boxScale) | 0;
    const x = 0;
    const y = ((origin.height - h) / HALF) | 0;
    return {w, h, y, x};
  } else {
    const w = (origin.height / boxScale) | 0;
    const h = origin.height;
    const y = 0;
    const x = ((origin.width - w) / HALF) | 0;
    return {w, h, y, x};
  }
}
const fillScaleSource: ScaleSourceActor = function ({box, origin}) {
  return containScaleSource({box, origin});
}
const noneScaleSource: ScaleSourceActor = function ({box, origin}) {
  return containScaleSource({box, origin});
}


function scaleOriginToBox({
                            objectFit,
                            box,
                            origin
                          }: ScaleOriginToBoxParams): [Omit<StreamDescription, 'z'>, FfmpegPositionCoords] {
  let scaleSource: ScaleSourceActor;
  switch (objectFit) {
    case "contain":
      scaleSource = containScaleSource;
      break;
    case 'cover':
      scaleSource = coverScaleSource;
      break;
    case "fill":
      scaleSource = fillScaleSource;
      break;
    default:
      scaleSource = noneScaleSource;
      break;
  }
  let blackRectangle = {x: 0, y: 0, w: 0, h: 0};
  const source = scaleSource({box, origin});
  let target = {
    x: box.left,
    y: box.top,
    w: box.width,
    h: box.height
  }
  if (source.w / source.h !== target.w / target.h) {
    const fixedVideoPlace = getTargetMiddleOffset({source, target});
    blackRectangle = {...target};
    target = fixedVideoPlace;
  }
  return [{
    target,
    source
  }, blackRectangle]
}

function getTargetMiddleOffset({source, target}: Omit<StreamDescription, 'z'>): FfmpegPositionCoords {
  const sourceProportions = source.w / source.h;
  const targetProportions = target.w / target.h;
  if ((targetProportions - sourceProportions) <= 0) {
    // scale by width
    const scaledHeight = (target.w / sourceProportions) | 0
    const deltaHeight = target.h - scaledHeight;
    return {x: target.x, y: target.y + (deltaHeight / HALF) | 0, w: target.w, h: scaledHeight};
  } else {
    // scale by height
    const scaledWidth = (target.h * sourceProportions) | 0;
    const deltaWidth = target.w - scaledWidth;
    return {x: target.x + (deltaWidth / HALF) | 0, y: target.y, w: scaledWidth, h: target.h};
  }
}

type MarginPaddings =
    'paddingBottom'
    | 'paddingLeft'
    | 'paddingRight'
    | 'paddingTop'
    | 'marginLeft'
    | 'marginRight'
    | 'marginBottom'
    | 'marginTop';

function formatLabelMargins(opt: Pick<VoxTilerTitleInput, MarginPaddings | 'margin' | 'padding'>): Required<Pick<VoxTilerTitleInput, MarginPaddings>> {
  const readyMargins = {
    marginLeft: opt.margin || 0,
    marginRight: opt.margin || 0,
    marginBottom: opt.margin || 0,
    marginTop: opt.margin || 0,
    paddingLeft: opt.padding || 0,
    paddingRight: opt.padding || 0,
    paddingBottom: opt.padding || 0,
    paddingTop: opt.padding || 0
  }
  const fields: MarginPaddings[] = ['paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop', 'marginLeft', 'marginRight', 'marginBottom', 'marginTop'];
  fields.forEach((key) => {
    if (typeof opt[key] === 'number' && !isNaN(opt[key] as number)) {
      readyMargins[key] = opt[key] as number;
    }
  })
  return readyMargins;
}

function generateLabelWithRectangle(params: { baseRect: FfmpegPositionCoords, labelSettings: VoxTilerTitleInput }): { rectangle: RectangleDescription, label: LabelDescription } {
  const {labelSettings, baseRect} = params;
  //calculate box size.
  // 1. Box width can't be bigger than rect.w-2*margin
  // 2. Box height can't be bigger than rect.h-2*margin
  const margins = formatLabelMargins({
    margin: labelSettings.margin,
    marginLeft: labelSettings.marginLeft,
    marginRight: labelSettings.marginRight,
    marginBottom: labelSettings.marginBottom,
    marginTop: labelSettings.marginTop,
    padding: labelSettings.padding,
    paddingLeft: labelSettings.paddingLeft,
    paddingRight: labelSettings.paddingRight,
    paddingBottom: labelSettings.paddingBottom,
    paddingTop: labelSettings.paddingTop,
  });
  const maxLabelW = baseRect.w - margins.marginLeft - margins.marginRight;
  const maxLabelH = baseRect.h - margins.marginTop - margins.marginBottom;
  const targetLabelW = (labelSettings.width <= maxLabelW) ? labelSettings.width : maxLabelW;
  const targetLabelH = (labelSettings.height <= maxLabelH) ? labelSettings.height : maxLabelH;
  const position: ['top' | 'bottom' | 'middle', 'left' | 'center' | 'right'] = labelSettings.position.split(' ') as ['top' | 'bottom' | 'middle', 'left' | 'center' | 'right'];
  let targetLabelX = 0;
  let targetLabelY = 0;
  switch (position[0]) {
    case 'top':
      targetLabelY = baseRect.y + margins.marginTop;
      break;
    case 'bottom':
      targetLabelY = baseRect.y + baseRect.h - margins.marginBottom - targetLabelH;
      break;
    case 'middle':
      targetLabelY = baseRect.y + baseRect.h / 2 - targetLabelH / 2;
      break;
    default:
      targetLabelY = baseRect.y + baseRect.h - margins.marginBottom - targetLabelH;
      break;
  }
  switch (position[1]) {
    case "left":
      targetLabelX = baseRect.x + margins.marginLeft;
      break;
    case "right":
      targetLabelX = baseRect.x + baseRect.w - margins.marginRight - targetLabelW;
      break;
    case "center":
      targetLabelX = baseRect.x + baseRect.x / 2 - targetLabelW / 2;
      break;
    default:
      targetLabelX = baseRect.x + baseRect.w - margins.marginRight - targetLabelW;
      break;
  }
  const fontsize = (targetLabelH - margins.paddingTop - margins.paddingBottom)/1.5;
  return {
    rectangle: {
      w: targetLabelW | 0,
      h: targetLabelH | 0,
      thickness: 0,
      fill: true,
      color: labelSettings.background,
      x: targetLabelX | 0,
      y: targetLabelY | 0,
      z: 0,
    },
    label: {
      color: labelSettings.color,
      text: labelSettings.label,
      size: fontsize | 0,
      w: targetLabelW | 0,
      h: targetLabelH | 0,
      x: (targetLabelX + margins.paddingLeft) | 0,
      y: (targetLabelY + margins.paddingTop) | 0,
      z: 0,
    }
  }
}


function* zIndexGenerator() {
  let z = 0;
  while (true) {
    yield z;
    z++;
  }
}

function formatForFfmpeg(input: RawOutput[]): FfmpegOutputFormat {
  const streams: { [id: string]: StreamDescription } = {};
  const rectangles: RectangleDescription[] = []
  const labels: LabelDescription[] = []
  const zIndexCounter = zIndexGenerator();
  input.forEach(record => {
    if (record.stream) {
      const box: BoxParams = {
        width: record.width,
        height: record.height,
        top: record.top,
        left: record.left
      }
      const origin: OriginParams = {
        width: record.stream.baseWidth || 0,
        height: record.stream.baseHeight || 0,
      }
      const objectFit = record.stream.objectFit;
      const [scaleResult, blackRectangle] = scaleOriginToBox({objectFit, box, origin})
      if (blackRectangle.w && blackRectangle.h) {
        rectangles.push({
          ...blackRectangle,
          z: zIndexCounter.next().value || 0,
          fill: true,
          thickness: 0,
          color: '#000000',
        })
      }
      streams[record.stream.id] = {
        z: zIndexCounter.next().value || 0,
        target: scaleResult.target,
        source: scaleResult.source
      }
      if (record.stream.title) {
        const labelInfo = generateLabelWithRectangle({baseRect: blackRectangle, labelSettings: record.stream.title});
        rectangles.push({
          ...labelInfo.rectangle,
          z: zIndexCounter.next().value || 0,
        })
        labels.push({
          ...labelInfo.label,
          z: zIndexCounter.next().value || 0,
        })
      }
      if (record.stream.vad) {
        rectangles.push({
          ...blackRectangle,
          z: zIndexCounter.next().value || 0,
          thickness: record.stream.vad.thickness,
          color: record.stream.vad.color,
        })
      }
    }
  })
  return {
    streams,
    rectangles,
    labels
  };
}

function generateFfmpegRaster({width,height,text}:{width:number,height:number,text:boolean}):FfmpegOutputFormat{
  const rectangles: RectangleDescription[] = [];
  const labels: LabelDescription[] = []
  let z=0;
  //first pack of lines
  const hLineCount = (height/10)|0;
  const vLineCount = (width/10)|0;

  for(let i=0; i<hLineCount;i++){
    const baseRect = {
      w: width,
      h: 1,
      x: 0,
      y: 0,
      z,
      color: '#CC0000',
      thickness: 1
    }
    z++;
    let y = i*10;
    if(y<=height) {
      rectangles.push({...baseRect,y,z})
    }
    y = y+5;
    z++;
    if(y<=height) {
      rectangles.push({...baseRect,y,z, color:'#CCCC00'})
    }
  }
  for(let i=0;i<vLineCount;i++){
    const baseRect = {
      w: 1,
      h: height,
      x: 0,
      y: 0,
      z,
      color: '#00CC00',
      thickness: 1
    }
    z++;
    let x = i*10;
    if(x<=width) {
      rectangles.push({...baseRect,x,z})
    }
    x = x+5;
    z++;
    if(x<=width) {
      rectangles.push({...baseRect,x,z, color:'#00CCCC'})
    }
  }
  for(let i=0;i<21;i++){
    labels.push({
      x:10,
      w:200,
      y:(10+20*i),
      z:1000+i,
      color:'#FFFFFF',
      h:20,
      size:i+1,
      text:`${i+1}size${10+20*i}y20h`
    })
    labels.push({
      x:220,
      w:200,
      y:(10+20*i),
      z:1100+i,
      color:'#FFFFFF',
      h:i+1,
      size:i+1,
      text:`${i}size${10+20*i}y${i+1}h`
    })
    labels.push({
      x:440,
      w:200,
      y:(10+20*i),
      z:1200+i,
      color:'#FFFFFF',
      h:i+1,
      size:16,
      text:`16size${10+20*i}y${i+1}h`
    })
  }
  return{
    streams:{},
    rectangles,
    labels
  }
}

export {formatForFfmpeg, generateFfmpegRaster}