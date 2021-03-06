import EventEmitter from "events";
import { loggers } from "winston";

import { createLogger } from "./Helper/Logger";
import { ScanButton } from "./Hardware/ScanButton";
import { ScanLED } from "./Hardware/ScanLED";
import { sleep, EventNames } from "./Helper/Helper";
import { ScanService } from "./Services/ScanService";
import { Mailer } from "./Services/Mailer";

createLogger();

let logger = loggers.get("scantoollogger");

logger.info("APPLICATION startet!");
logger.info("====================");

let ev = new EventEmitter();

logger.info("Initializing hardware...");
let scanButton = new ScanButton(ev);
let scanLed = new ScanLED(ev);
logger.info("Hardware ready!");

logger.info("Initializing services...");
let scanService = new ScanService(ev);
let mailService = new Mailer(ev);
logger.info("Services ready!");

ev.on(EventNames.ScanButtonPressed, async () => {
    let scannedDocument = "";

    try {
        scannedDocument = await scanService.scanDocument();
    } catch (ex) {
        logger.error(`Error scanning document: ${ex}`);
    }

    if (scannedDocument !== "") {
        try {
            await mailService.sendMail(scannedDocument)
        } catch (ex) {
            logger.error(`Error sending document: ${ex}`);
        }
    } 

    logger.info("Sending finish...");
    ev.emit(EventNames.ScanFinished);
});

process.on('SIGINT', _ => {
    logger.info("Killing the gpios")
    ev.emit(EventNames.Cleanup);
});