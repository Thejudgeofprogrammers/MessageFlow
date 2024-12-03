import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { errMessages } from 'src/common/messages';

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) {}

    async generateToken(payload: any): Promise<string> {
        try {
            return this.jwtService.sign(payload);
        } catch (e) {
            throw new Error(e);
        }
    }

    async verifyToken(token: string): Promise<any> {
        try {
            return await this.jwtService.verify(token);
        } catch (e) {
            throw new Error(errMessages.INVALID_TOKEN);
        }
    }

    decodeToken(token: string): any {
        return this.jwtService.decode(token);
    }
}
