import { Gpio } from "onoff";
import { EventEmitter } from "events";
import { loggers, Logger } from "winston";

import { EventNames } from "../Helper/Helper";

export class ScanButton{
    eventEmitter: EventEmitter
    logger: Logger;

    scanButton: Gpio;
    scanning: boolean = false;

    constructor(eventEmitter: EventEmitter) {
        this.eventEmitter = eventEmitter;

        this.logger = loggers.get("scantoollogger");

        this.scanButton = new Gpio(18, "in", "rising", { debounceTimeout: 10})
        this.scanButton.watch(this.buttonClicked.bind(this))   
    
        this.eventEmitter.on(EventNames.ScanBegin, () => { 
            this.scanning = true; 
        });
        this.eventEmitter.on(EventNames.ScanFinished, () => this.scanning = false);

        this.eventEmitter.on(EventNames.Cleanup, () => this.scanButton.unexport());
    }   

    buttonClicked() {
        if(this.scanning) {
            this.logger.info("Scan already in progress!")
            return;
        }
        this.eventEmitter.emit(EventNames.ScanButtonPressed);
    }
}