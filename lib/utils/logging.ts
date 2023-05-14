import winston from 'winston';

// From:
// https://www.digitalocean.com/community/tutorials/how-to-use-winston-to-log-node-js-applications-on-ubuntu-20-04

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level}: ${message}`;
    })
 );

// define the custom settings for each transport (file, console)
const options = {
    console: {
        level: "none",
        handleExceptions: true,
        format: logFormat
    },
};


let logger = winston.createLogger({
        transports: [
            new winston.transports.Console(options.console),
        ],
        exitOnError: false, // do not exit on handled exceptions
    });

export function enableLogging(log: winston.Logger | string) {
    if (log instanceof winston.Logger) {
        logger = log;
        return;
    }

    logger.transports.filter((t: winston.transport) => t instanceof winston.transports.Console)
        .forEach((t: winston.transport) => t.level = log);
}

export default logger;
