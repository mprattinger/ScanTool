import { transports, loggers, format } from "winston";

const { combine, timestamp, label, prettyPrint, colorize } = format;

export function createLogger() {
    loggers.add("scantoollogger", {
        format: combine(
            timestamp(),
            prettyPrint(),
            colorize()
        ),
        transports: [
            new transports.Console()
        ]
    })
}