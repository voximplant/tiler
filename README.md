# @voximplant/tiler

Voximplant Tiler is a video conference layout manager.

This manager is designed for developers to create and manage video layouts in conference solutions with ease. In this library, which is also used in VoxEngine, we focused on declarative and precise layout descriptions.

- [Conferences in Voximplant](https://voximplant.com/docs/guides/conferences)
- [Hold a conference now!](https://videoconf.voximplant.com)

## Quickstart

The library allows developers to create a Tiler instance with a certain layout type, and to get layout coordinates and size quickly for each video element.

### Installation

```bash
  yarn add @voximplant/tiler
  // OR
  npm install @voximplant/tiler
```

### Import and set up

See the Tiler usage example below to understand how it works:

```javascript
import {createTiler} from '@voximplant/tiler'

// get the DOM element where you want to render the video
const endpointsContainer = document.querySelector('.endpoint-container'); 

const width = endpointsContainer.clientWidth;
const height = endpointsContainer.clientHeight;

const tilerOptions = {
  width, // container width
  height, // container height
  outputFormat: 'web', // the output format. currently formats for a web browser
  debug: true, // specifies whether to write debug messages to the console
  areas: [  // video rendering areas options
    {   // the array's element describes an area to render the video 
      priority: 0, // the area's priority. the higher it is, the higher the area on the z axis
      width,   // the area's width. as there's only one area, the width equals the container width
      height,  // the area's height. as there's only one area, the height equals the container height
      top: 0,  // the area's offset vertically
      left: 0, // the area's offset horizontally
      grid: [  // video layers grid within the area
        { fromCount: 1, toCount: 1, colCount: 1, rowCount: 1 },
        { fromCount: 2, toCount: 2, colCount: 2, rowCount: 1 },
        { fromCount: 3, toCount: 4, colCount: 2, rowCount: 2 },
        { fromCount: 5, toCount: 6, colCount: 3, rowCount: 2 },
        { fromCount: 7, toCount: 9, colCount: 3, rowCount: 3 },
        { fromCount: 9, toCount: 12, colCount: 4, rowCount: 3 },
        { fromCount: 12, toCount: 16, colCount: 4, rowCount: 4 },
        { fromCount: 16, toCount: 20, colCount: 5, rowCount: 4 },
        { fromCount: 20, toCount: 25, colCount: 5, rowCount: 5 },
        { fromCount: 25, toCount: 30, colCount: 6, rowCount: 5 },
      ]
    }
  ]
}

let activeTiler = createTiler(tilerOptions);

const tiles = activeTiler.compose([{id:'foo'},{id:'bar'},{id:'baz'}]);

// tiles rendering

endpointsContainer.innerHTML = '';
tiles.forEach(tile=>{
  const tileElement = document.createElement('video');
  tileElement.style.position = 'absolute';
  tileElement.style.backgroundColor = 'red';
  tileElement.src = 'https://samplelib.com/lib/preview/mp4/sample-20s.mp4'; 
  tileElement.style.top = tile.top;
  tileElement.style.left = tile.left;
  tileElement.style.width = tile.width;
  tileElement.style.height = tile.height;
  tileElement.addEventListener('canplaythrough',()=>{
    tileElement.play();
  })
  endpointsContainer.appendChild(tileElement);
  tileElement.load();
})
```

Here is what the Tiler configuration and i/o formats are.

### Terminology

A container is a field where a video renders:
Picture 1

```
|-------------------------|
|                         |
|                         |
|        container        |
|                         |
|                         |
|-------------------------|
```

Inside a container, there can be one or several areas.

A container with one area:
Picture2

```
|-------------------------|
||-----------------------||
||                       ||
||          area         ||
||                       ||
||-----------------------||
|-------------------------|
```

An example of a container with two areas beside:
Picture 3

```
|-------------------------|
||--------------||-------||
||              ||       ||
||      A       ||   B   ||
||              ||       ||
||--------------||-------||
|-------------------------|

A — the first area
B — the second area
```

The areas can interlap:
Picture 4

```
|-------------------------|
||-----------------------||
||              |------| ||
||      A       |   B  | ||
||              |------| ||
||-----------------------||
|-------------------------|

A — the first area
B — the second area
```

In each area there can be different grids. Grids differ by the participants number.
Each grid is a table with a certain number of rows and columns.

Picture 5

```
An example of two participants:

The A area zoomed
|---------------------------------------|
||------------------|------------------||
||                  |                  ||
||                  |                  ||
||   Participant 1  |  Participant 2   ||
||                  |                  ||
||                  |                  ||
||------------------|------------------||
|---------------------------------------|

An example of four participants could look like this:

The A area zoomed
|---------------------------------------|
||------------------|------------------||
||   Participant 1  |  Participant 2   ||
||                  |                  ||
||------------------|------------------||
||   Participant 3  |  Participant 4   ||
||                  |                  ||
||------------------|------------------||
|---------------------------------------|
```

Each participant's place in the grid is called a nest.

### Layout format description

Let us start with the configuration format. All settings could be divided into 3 categories:
- the container's options
- the area's options
- the grid's options

#### The container's options: `VoxTilerOptions`

- **width** and **height** specify the container's size. The container can be only rectangular shape, and its width and height can be only integer values in pixels. **Both options are required**. You can read Voximplant's recommendations on how to work with dynamic containers and process browser windows resizing in the [Changing the container size](#changing-the-container-size) section
- **outputFormat** describes the video output format. There are 2 formats available currently: web and ffmpeg. The web format has a munimum set of options, but it is the best choice, as it processes all necessary tasks for rendering a video in a web browser. **The option is required**. You can learn more about creating your own output format in the [I/O formats](#io-formats) and [How to add your own output format](#how-to-add-your-own-output-format) section
- **areas** is an array of areas settings. The areas can interlap. You can visualize them as a set of `<div>` elements to display the video. **The option is required. At least one area should be set up**. See the option's description below
- **direction** is an option that specifies container filling direction. There are two values available: `ltr` and `rtl`. The option is optional, the default value is `ltr`
- **debug** is a boolean option which specifies whether to show debug messages and the `logger` field values in the browser console. The default value is `false`
- **logger** allows developers to replace the loger function. The default value is `console.log`. You can read more about this option in the [Debug and logging](#debug-and-logging) section

#### The area's options: `VoxTilerDrawArea`

- **priority** specifies the area's priority. This option's value is the area's unique identifier. There cannot be two or more areas with the same priority. Areas distribution starts with the area with the lowest value. If two areas overlap, the area with the lower priority has the lower z-index, i.e. placed under the area with higher priority. **This option is required**
- **width** and **height** specify the area's size. The container can be only rectangular shape, and its width and height can be only integer values in pixels. **Both options are required**
- **top** and **left** specify the area's upper left corner offset from the container. **Both options are required**
- **overflow** specifies the behavior of the elements which do not fit in any grids in the current container. This option is optional. The default value is `none`. You can read more in the [Overflow processing examples](#overflow-processing-examples) The values can be:
  - `none` - the elements are ignored and not shown
  - `next` - the elements are included with higher priorities in the next area. If there are no next area, the elements are ignored and not shown
  - any digit - the elements are included with highter priorities in the specified area. if there is no area, the elements are ignored and not shown
- **grid** is an array of grid options within the current area. Depending on the participants number, one of the grids is chosen to calculate the nest sizes for video rendering

#### The grid's options: `VoxTilerGridDefinition`

- **fromCount** and **toCount** describe the minimum and maximum number of possible participants within the grid. If fromCount <= participants number >= to count, the grid is chosen to display the participants. **Both options are required**
- **colCount** and **rowCount** describe the number of columns and rows within the grid. **Both options are required**
- **margin** describes the margins between the video nests. Can be a number or an array of two numbers, where the first is the horizontal margin, and the second is the vertical one
- **centerLast** is a boolean option which specifies whether to align the lower row by center if the nests count is lower than the other rows. The default value is false
- **forceAspectRatio** allows you to force the nest's aspect ratio. The default value is not defined

### I/O formats

The video streams are placed in the nests in the order they were added.
If the `area` option is specified, the video is sorted within the specified area.

#### Input and output parameters for the web format

There are minimum set of input parameters:
- **id** — specifies the participant ID. **This parameter is required**
- **area** — is an optional parameter which specifies a certan area for the participant. The area is distributed according to the area's `priority` option

The output parameters are:
- **stream** — specifies information about the current participant
- **width** and **height** — specify the width and height of the participant's nest in pixels
- **top** and **left** — specify the offset of the upper left corner of the nest from the container

### Overflow processing examples

For example, you have 2 areas:

```
|---------------------------------------------|
||------------------------||-----------------||
||                        ||                 ||
||                        ||                 ||
||                        ||                 ||
||                        ||                 ||
||                        ||                 ||
||           A            ||        B        ||
||                        ||                 ||
||                        ||                 ||
||                        ||                 ||
||                        ||                 ||
||------------------------||-----------------||
|---------------------------------------------|

A - the first area, priority 0
B - the second area, priority 1
```

In the first area, there are grids from 1 to 4 participants. You want to add a 5th participant without specifying the area.

If the A area has `overflow:next` specified:

```
|---------------------------------------------|
||-----------|------------||-----------------||
||           |            ||  Participant5   ||
||           |            ||                 ||
|| Particip1 | Particip2  ||-----------------||
||           |            ||                 ||
||           |            ||                 ||
||-----------|------------||                 ||
||           |            ||                 ||
|| Particip3 | Particip4  ||                 ||
||           |            ||                 ||
||           |            ||                 ||
||------------------------||-----------------||
|---------------------------------------------|

A - the first area, priority 0
B - the second area, priority 1
```

The 5th participant is moved to the B area with the highest priority, because it did not fit into the A area and the overflow is set to `next`.

If the A area has `overflow:1` specified:

```
|---------------------------------------------|
||-----------|------------||-----------------||
||           |            ||  Particip5      ||
||           |            ||                 ||
|| Particip1 | Particip2  ||-----------------||
||           |            ||                 ||
||           |            ||                 ||
||-----------|------------||                 ||
||           |            ||                 ||
|| Particip3 | Particip4  ||                 ||
||           |            ||                 ||
||           |            ||                 ||
||------------------------||-----------------||
|---------------------------------------------|

A - the first area, priority 0
B - the second area, priority 1
```

The 5th participant is moved to the B area with the highest priority, because it did not fit into the A area and the overflow is set to move overflow participants to the area with the 1 priority.

If the A area has `overflow:none` specified:

```
|---------------------------------------------|
||-----------|------------||-----------------||
||           |            ||                 ||
||           |            ||                 ||
|| Particip1 | Particip2  ||                 ||
||           |            ||                 ||
||           |            ||      Empty      ||
||-----------|------------||                 ||
||           |            ||                 ||
|| Particip3 | Particip4  ||                 ||
||           |            ||                 ||
||           |            ||                 ||
||------------------------||-----------------||
|---------------------------------------------|

A - the first area, priority 0
B - the second area, priority 1
```

The 5th participant did not fit in the A area, and the overflow setting is set to `none`, that is why the 5th participant is ignored and not shown at all.

### Changing the container size

To increase the processing speed, Tiler works with a fixed container size, where it distributes elements. That is why when you change the browser window size, you need to recreate the Tiler instance.

```javascript
// get the DOM element where you want to render the video
const endpointsContainer = document.querySelector('.endpoint-container');

const resizeObserver = new ResizeObserver(
    debounce((element) => {
      const {width, height} = element[0].contentRect;
      activeTiler = createTiler({...tilerOptions, width, height});
    }, 200)
  );
resizeObserver.observe(endpointsContainer);
```

### Debug and logging

By default, Tiler does not log the events. To log the events, set the `debug` option to `true`.
In some situations, debugging in the browser console is not suitable, for example, if you want to record logs into a variable to send the log as a user report. In this case, you can replace the logger function and place it to the `logger` option.

```javascript
let customLogger = [];

activeTiler = reateTiler({
  ...tilerOptions, 
  debug:true, 
  logger: function(...params){
    customLogger.push(params.map(JSON.stringify).join(', '));
  }});
```

### How to debug custom layouts

You can use the `playground/index.html` file to debug your custom layouts.
You will see your layout behind the layout editor.
You can use the `canvas.width` and `canvas.height` variables to substitute in the layout.

## Development mode and testing

Watch mode for development:

```bash
   yarn dev
```

Build Tiler:

```bash
  yarn build
```

Unit tests:

```bash
  yarn test
```

#### How to add your own output format

The Tiler library provides 2 output formats:
- **web** - the format is designed to render video in a web browser. It returns the size of the nest in pixels and the offset from the container's upper left corner
- **ffmpeg** - the format that renders video via ffmpeg. Includes all necessary options for video resizing, cropping, displaying participants' names and highlighting the microphone activity (VAD), and creating a video record in ffmpeg

To add a custom video output format:
- extend the VoxTilerOptions.outputFormat
- describe the new formatter in the outputFormaters folder. We recommend you to use formatForWeb.ts as boilerplate
- add the formatter to the TilerWorker.formatOutput function