import nodemailer from "nodemailer";
import EventEmitter from "events";
import { loggers, Logger } from "winston";
import * as dotenv from "dotenv";
import Mail from "nodemailer/lib/mailer";

export class Mailer {

    eventEmitter: EventEmitter;
    logger: Logger;
    transport: Mail;
    
    constructor(ev: EventEmitter) {
        this.eventEmitter = ev;
        this.logger = loggers.get("scantoollogger");

        let envPath = __dirname+'/../../.env';
        this.logger.info(`EnvPath ist ${envPath}`)
        dotenv.config({ path: envPath});

        this.logger.info(`Creating transport for mailing...`)
        try {
            this.transport = nodemailer.createTransport({
                host: process.env.MAILSMTP,
                port: Number(process.env.MAILSMTPPORT),
                auth: {
                    user: process.env.MAILUSERNAME,
                    pass: process.env.MAILPASSWORD
                }
            });
        } catch(ex) {
            this.logger.error(`Error creating mail transport: ${ex}`);
            throw ex;
        }
        this.logger.info(`Transport created!`)
    }

    public sendMail(document: string): Promise<boolean> {
        return new Promise(async (res, rej) => {
            try {
                var docItems = document.split("/");
                var doc = docItems[docItems.length - 1];

                this.logger.info(`Sending email...`);
                await this.transport.sendMail({
                    from: "mprattinger@outlook.com",
                    to: "mprattinger@outlook.com",
                    subject: `Ihr scan: ${doc}`,
                    html: '<h1>Anbei Ihr gescanntes Dokument</h1><p>Vielen Dank das sie ein Dokument gescannt haben!</p>',
                    attachments: [
                        {
                            filename: doc,
                            path: document
                        }
                    ]
                });
                this.logger.info(`Mail sent!`);

                res(true);
            } catch(ex) {
                rej(ex);
            }
        });
    }
}