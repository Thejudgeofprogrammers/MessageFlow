export const StatusClient = {
    HTTP_STATUS_OK: { message: 'OK', status: 200 },
    HTTP_STATUS_BAD_REQUEST: { message: 'Bad Request', status: 400 },
    HTTP_STATUS_UNAUTHORIZED: { message: 'Unauthorized', status: 401 },
    HTTP_STATUS_NOT_FOUND: { message: 'Not Found', status: 404 },
    HTTP_STATUS_INTERNAL_SERVER_ERROR: {
        message: 'Internal Server Error',
        status: 500,
    },
    RPC_EXCEPTION: {
        message: 'Error connecting to gRPC server',
        status: 14,
    },
    HTTP_STATUS_CONFLICT: { message: 'Conflict', status: 409 },
};
