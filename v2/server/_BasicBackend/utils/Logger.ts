import {TransformableInfo} from "logform";
import {LOG_LEVEL, LOG_FORMAT} from "../../Config";
import {createLogger, format, Logger, transports} from "winston";

export default class Log {
    private logger: Logger;
    private static _instance: Log;

    private constructor() {
        this.logger = createLogger({
            level: LOG_LEVEL,
            format: format.combine(
                format.colorize(),
                format.timestamp({format: LOG_FORMAT}),
                format.align(),
                format.printf(Log.format)
            ),
            transports: [new transports.Console()],
        });
    }

    private static format(info: TransformableInfo): string {
        const {timestamp, level, message, file, ...args} = info;
        const formatted = Object.keys(args).length > 0 ? JSON.stringify(args) : "";

        return `${timestamp} [${level}] ${file}:  ${message} ${formatted}`;
    }

    public static getInstance(): Log {
        return this._instance || (this._instance = new this());
    }

    private static getSourceFile(): string {
        const source = (new Error().stack || "").split("at ")[3];
        const start = source.lastIndexOf("/") + 1;

        return source.substr(start, source.indexOf(":") - start - 3);
    }

    public debug(message: string, ...data: any[]): void {
        Log.getInstance().logger.debug(message, Object.assign(data, {file: Log.getSourceFile()}));
    }

    public info(message: string, ...data: any[]): void {
        Log.getInstance().logger.info(message, Object.assign(data, {file: Log.getSourceFile()}));
    }

    public warn(message: string, ...data: any[]): void {
        Log.getInstance().logger.warn(message, Object.assign(data, {file: Log.getSourceFile()}));
    }

    public error(message: string, ...data: any[]): void {
        Log.getInstance().logger.error(message, Object.assign(data, {file: Log.getSourceFile()}));
    }
}
