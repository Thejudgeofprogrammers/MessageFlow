import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { errMessages } from 'src/common/messages';
import { WinstonLoggerService } from '../logger/logger.service';

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly logger: WinstonLoggerService,
    ) {}

    async generateToken(payload: any): Promise<string> {
        this.logger.debug('Starting generateToken process');
        try {
            this.logger.log('Token generated successfully');
            return this.jwtService.sign(payload);
        } catch (e) {
            this.logger.warn('Invalid token provided');
            throw new Error(e);
        }
    }

    async verifyToken(token: string): Promise<any> {
        try {
            this.logger.log('Token verified successfully');
            return await this.jwtService.verify(token);
        } catch (e) {
            this.logger.warn('Invalid token provided');
            throw new Error(errMessages.INVALID_TOKEN);
        }
    }

    decodeToken(token: string): any {
        return this.jwtService.decode(token);
    }
}
