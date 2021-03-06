import EventEmitter from "events";
import { stat, mkdir, rm } from "fs";
import { loggers, Logger } from "winston";
import { EventNames } from "../Helper/Helper";
import { exec } from "child_process";
import dateformat from "dateformat";

export class ScanService {
    readonly tempDir = "./tmp";
    readonly scanDir = "/scans";

    eventEmitter: EventEmitter;
    logger: Logger;

    constructor(ev: EventEmitter) {
        this.eventEmitter = ev;
        this.logger = loggers.get("scantoollogger");
    }

    public scanDocument(): Promise<string> {
        return new Promise(async (res, rej) => {
            try {
                this.logger.info("Sending begin...");
                this.eventEmitter.emit(EventNames.ScanBegin);

                this.logger.info("Checking if tmp dir exists...");
                await this.checkScanDir();
                this.logger.info("Done!");

                this.logger.info("Scanning document to temp folder...");
                await this.scanit();
                this.logger.info("Done!");

                this.logger.info("Converting scan to pdf...");
                let scannedDocument = await this.convertToPDF();
                this.logger.info(`Done! Document was ${scannedDocument}`);

                this.logger.info("Cleaning up temp folder...");
                await this.cleanup();
                this.logger.info("Done!");

                res(scannedDocument);
            } catch (ex) {
                rej(ex);
            }
        });
    }

    private async checkScanDir(): Promise<boolean> {
        return new Promise((res, rej) => {
            stat(this.tempDir, (err) => {
                if (!err) {
                    this.logger.info("Dir exists");
                    res(true);
                }
                else if (err.code === "ENOENT") {
                    mkdir(this.tempDir, err => {
                        if (err) rej(err);
                        else res(true);
                    });
                }
            });
        });
    }

    private async scanit(): Promise<boolean> {
        return new Promise((res, rej) => {
            let command = `cd ${this.tempDir} && scanimage -b --batch-count 1 --format png -d 'pixma:04A91736_31909F' --resolution 150`;

            exec(command, (err, stdout, stderr) => {
                if(err) {
                    rej(`Error calling command ${command} (${err}). ${stderr}`);
                } else {
                    this.logger.info(`Scan command (${command}) called. Output was ${stdout}`);
                    res(true);
                }
            });
        });
    }

    private async convertToPDF(): Promise<string> {
        return new Promise((res, rej) => {
            let fname = dateformat(new Date(), "yyyy-mm-dd_HH-MM-ss");
            let docPath = `${this.scanDir}/${fname}.pdf`
            let command = `cd ${this.tempDir} && convert *.png ${docPath}`;

            exec(command, (err, stdout, stderr) => {
                if(err) {
                    rej(`Error calling command ${command} (${err}). ${stderr}`);
                } else {
                    this.logger.info(`Convert command (${command}) called. Output was ${stdout}`);
                    res(docPath);
                }
            });
        });
    }

    private async cleanup(): Promise<boolean> {
        return new Promise((res, rej) => {
            try {
                rm(this.tempDir, { recursive: true, maxRetries: 5}, (err) => {
                    if(err) throw err;
                    else res(true);
                });
            } catch (ex) {
                rej(`Error cleaning up the output folder: ${ex}`);
            }
        });
    }
}