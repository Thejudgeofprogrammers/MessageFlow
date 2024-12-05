import {
    Injectable,
    NestMiddleware,
    OnModuleInit,
    Inject,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Request, Response, NextFunction } from 'express';
import { from, lastValueFrom } from 'rxjs';
import { errMessages } from 'src/common/messages';
import { StatusClient } from 'src/common/status';
import { exludeRoutes } from 'src/config/exlude_route';
import { SessionUserService } from 'src/protos/proto_gen_files/session_user';
import { WinstonLoggerService } from '../logger/logger.service';

@Injectable()
export class SessionMiddleware implements NestMiddleware, OnModuleInit {
    private sessionUserMicroservice: SessionUserService;

    constructor(
        private readonly logger: WinstonLoggerService,

        @Inject('SESSION_USER_CLIENT')
        private readonly sessionUserClient: ClientGrpc,
    ) {}
    onModuleInit() {
        this.sessionUserMicroservice =
            this.sessionUserClient.getService<SessionUserService>(
                'SessionUserService',
            );
    }

    async use(req: Request, res: Response, next: NextFunction) {
        const { originalUrl } = req;
        const { userId, jwtToken } = req.cookies;

        if (exludeRoutes.includes(originalUrl)) {
            this.logger.debug(
                `Route ${originalUrl} is excluded from authentication.`,
            );
            return next();
        }

        this.logger.debug(`Authenticating request for route: ${originalUrl}`);

        if (!userId || !jwtToken) {
            this.logger.warn(
                `Missing authentication data. UserId: ${userId}, JWT Token: ${jwtToken}`,
            );
            return res
                .json({
                    message: StatusClient.HTTP_STATUS_UNAUTHORIZED.message,
                })
                .status(StatusClient.HTTP_STATUS_UNAUTHORIZED.status);
        }

        try {
            this.logger.debug(`Validating user session for userId: ${userId}`);
            const response = await lastValueFrom(
                from(
                    this.sessionUserMicroservice.GetUserSession({
                        userId,
                    }),
                ),
            );

            if (response.jwtToken === jwtToken) {
                this.logger.log(
                    `User session validated successfully for userId: ${userId}`,
                );
                return next();
            } else {
                this.logger.warn(
                    `Invalid session for userId: ${userId}. Token mismatch.`,
                );
                return res
                    .json({
                        message: errMessages.use.sessionInvalid,
                    })
                    .status(StatusClient.HTTP_STATUS_UNAUTHORIZED.status);
            }
        } catch (e) {
            this.logger.error(
                `Error validating session for userId: ${userId}`,
                e.stack,
            );
            return res
                .json({
                    message: errMessages.use.sessionValidate,
                })
                .status(StatusClient.HTTP_STATUS_UNAUTHORIZED.status);
        }
    }
}
