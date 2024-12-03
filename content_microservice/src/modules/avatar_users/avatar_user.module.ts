import { Module } from '@nestjs/common';
import { AvatarUserContentService } from './avatar_user.service';

@Module({
    imports: [],
    providers: [AvatarUserContentService],
})
export class AvatarUserContentModule {}
