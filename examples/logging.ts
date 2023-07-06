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

let logger: winston.Logger;

export function enableLogging(log?: winston.Logger | string): winston.Logger {
    if (!log) {
        logger = winston.createLogger({
            transports: [ new winston.transports.Console(options.console) ],
            exitOnError: false, // do not exit on handled exceptions
        });
    } else if (typeof log === 'string') {
        logger.transports.forEach((t) => t.level = log);
    } else {
        logger = log;
    }
    return logger;
}

export function getLogger() { return logger }

export default logger;
