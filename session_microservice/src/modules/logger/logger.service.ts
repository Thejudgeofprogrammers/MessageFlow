import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

// Формат вывода в консоль с цветами
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level}: ${message}`;
    }),
);

// Транспорт для ротации файлов логов
const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/%DATE%-app.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true,
});

// Транспорт для отправки логов в Logstash через HTTP
const logstashTransport = new winston.transports.Http({
    host: process.env.HOST,
    port: +process.env.PORT,
    path: process.env.PATH,
    ssl: Boolean(process.env.SSL),
    format: winston.format.json(),
    level: 'info',
});

@Injectable()
export class WinstonLoggerService {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            transports: [
                logstashTransport, // Отправка логов в Logstash
                new winston.transports.Console({
                    format: consoleFormat,
                }),
                dailyRotateFileTransport,
            ],
        });
    }

    log(message: string) {
        this.logger.info(message);
    }

    error(message: string, trace?: string) {
        if (trace && message) {
            this.logger.error(message, trace);
        } else {
            this.logger.error(message);
        }
    }

    warn(message: string) {
        this.logger.warn(message);
    }

    debug(message: string) {
        this.logger.debug(message);
    }

    verbose(message: string) {
        this.logger.verbose(message);
    }
}
