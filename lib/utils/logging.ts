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
        level: "debug",
        handleExceptions: true,
        format: logFormat
    },
};

// Sucks that we can't just extend the Logger type atm, because it is served via factory
// https://github.com/winstonjs/winston/issues/1902

interface ExtendedLogger extends winston.Logger{
    setConsoleVerbosity?: Function
}

const logger:ExtendedLogger = winston.createLogger({
    transports: [
        new winston.transports.Console(options.console),
    ],
    exitOnError: false, // do not exit on handled exceptions
});

logger.setConsoleVerbosity = function(level: string) {
    this.transports.filter((t: winston.transport) => t instanceof winston.transports.Console)
        .forEach((t: winston.transport) => t.level = level);
}

export default logger;
