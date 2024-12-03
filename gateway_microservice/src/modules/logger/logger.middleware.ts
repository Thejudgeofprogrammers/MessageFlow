import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WinstonLoggerService } from './logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(private readonly logger: WinstonLoggerService) {}

    use(req: Request, res: Response, next: NextFunction) {
        const { method, url } = req;
        const start = Date.now();

        res.on('finish', () => {
            const duration = Date.now() - start;
            const { statusCode } = res;
            this.logger.log(
                `HTTP ${method} ${url} ${statusCode} - ${duration}ms`,
            );
        });

        next();
    }
}
