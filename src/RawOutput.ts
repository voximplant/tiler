import {SocketPosition} from "./SocketPosition";
import {VoxTilerInput} from "./VoxTilerInput";


interface RawOutput extends SocketPosition {
  stream: VoxTilerInput
}

export {RawOutput};