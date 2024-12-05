import { Transport, ClientOptions } from '@nestjs/microservices';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export const grpcClientOptionsUser: ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: process.env.GRPC_USER_SERVICE_URL,
        package: process.env.GRPC_USER_PACKAGE,
        protoPath: join(__dirname, process.env.GRPC_USER_PROTO_PATH),
    },
};

export const grpcClientOptionsSessionUser: ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: process.env.GRPC_SESSION_USER_SERVICE_URL,
        package: process.env.GRPC_SESSION_USER_PACKAGE,
        protoPath: join(__dirname, process.env.GRPC_SESSION_USER_PROTO_PATH),
    },
};

export const grpcClientOptionsAuth: ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: process.env.GRPC_AUTH_SERVICE_URL,
        package: process.env.GRPC_AUTH_PACKAGE,
        protoPath: join(__dirname, process.env.GRPC_AUTH_PROTO_PATH),
    },
};

export const grpcClientOptionsChat: ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: process.env.GRPC_CHAT_SERVICE_URL,
        package: process.env.GRPC_CHAT_PACKAGE,
        protoPath: join(__dirname, process.env.GRPC_CHAT_PROTO_PATH),
    },
};

export const grpcClientOptionsContent: ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: process.env.GRPC_CONTENT_SERVICE_URL,
        package: process.env.GRPC_CONTENT_PACKAGE,
        protoPath: join(__dirname, process.env.GRPC_CONTENT_PROTO_PATH),
    },
};
