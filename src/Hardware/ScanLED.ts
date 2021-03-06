import EventEmitter from "events";
import { Gpio } from "onoff";

import { EventNames } from "../Helper/Helper";

export class ScanLED {
    scanLed: Gpio;
    
    constructor(eventEmitter: EventEmitter)  {

        this.scanLed = new Gpio(23, "out");

        eventEmitter.on(EventNames.ScanBegin, async () => await this.scanLed.write(1));
        eventEmitter.on(EventNames.ScanFinished, async () => await this.scanLed.write(0));

        eventEmitter.on(EventNames.Cleanup, () => this.scanLed.unexport());
    }
}