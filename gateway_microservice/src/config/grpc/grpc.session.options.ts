import { Provider } from '@nestjs/common';
import { ClientGrpc, ClientProxyFactory } from '@nestjs/microservices';
import { SessionUserService } from 'src/protos/proto_gen_files/session_user';
import { grpcClientOptionsSessionUser } from 'src/config/grpc/grpc.options';

export const sessionUserProviders: Provider[] = [
    {
        provide: 'SESSION_USER_SERVICE',
        useFactory: (clientGrpc: ClientGrpc) => {
            return clientGrpc.getService<SessionUserService>(
                'SessionUserService',
            );
        },
        inject: ['SESSION_USER_CLIENT'],
    },
    {
        provide: 'SESSION_USER_CLIENT',
        useFactory: () => {
            return ClientProxyFactory.create(grpcClientOptionsSessionUser);
        },
    },
];
