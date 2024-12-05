import {
    makeCounterProvider,
    makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

export const prometheusProvidersCassandra = [
    makeCounterProvider({
        name: 'UPLOAD_AVATAR_USER_TOTAL',
        help: 'Total number of uploadAvatarUser calls',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'UPLOAD_AVATAR_USER_DURATION',
        help: 'Duration of uploadAvatarUser calls',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),
    makeCounterProvider({
        name: 'FIND_USER_AVATAR_ARRAY_TOTAL',
        help: 'Total number of findUserAvatarArray calls',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'FIND_USER_AVATAR_ARRAY_DURATION',
        help: 'Duration of findUserAvatarArray calls',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),
    makeCounterProvider({
        name: 'FIND_USER_AVATAR_TOTAL',
        help: 'Total number of findUserAvatar calls',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'FIND_USER_AVATAR_DURATION',
        help: 'Duration of findUserAvatar calls',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),
    makeCounterProvider({
        name: 'DELETE_USER_AVATAR_TOTAL',
        help: 'Total number of deleteUserAvatar calls',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'DELETE_USER_AVATAR_DURATION',
        help: 'Duration of deleteUserAvatar calls',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),
];
