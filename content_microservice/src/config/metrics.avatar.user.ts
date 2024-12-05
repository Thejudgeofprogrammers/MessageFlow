import {
    makeCounterProvider,
    makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

export const prometheusProvidersAvatarUser = [
    makeCounterProvider({
        name: 'UPLOAD_AVATAR_USER_TOTAL',
        help: 'Total number of avatar uploads for users',
        labelNames: ['result'],
    }),

    makeHistogramProvider({
        name: 'UPLOAD_AVATAR_USER_DURATION',
        help: 'Histogram of the duration of avatar uploads for users',
        buckets: [0.1, 0.3, 1.5, 5, 10],
    }),

    makeCounterProvider({
        name: 'FIND_USER_AVATAR_ARRAY_TOTAL',
        help: 'Total number of requests for finding user avatar arrays',
        labelNames: ['result'],
    }),

    makeHistogramProvider({
        name: 'FIND_USER_AVATAR_ARRAY_DURATION',
        help: 'Histogram of the duration for finding user avatar arrays',
        buckets: [0.1, 0.3, 1.5, 5, 10],
    }),

    makeCounterProvider({
        name: 'FIND_USER_AVATAR_TOTAL',
        help: 'Total number of requests for finding individual user avatars',
        labelNames: ['result'],
    }),

    makeHistogramProvider({
        name: 'FIND_USER_AVATAR_DURATION',
        help: 'Histogram of the duration for finding individual user avatars',
        buckets: [0.1, 0.3, 1.5, 5, 10],
    }),

    makeCounterProvider({
        name: 'DELETE_AVATAR_USER_TOTAL',
        help: 'Total number of avatar deletions for users',
        labelNames: ['result'],
    }),

    makeHistogramProvider({
        name: 'DELETE_AVATAR_USER_DURATION',
        help: 'Histogram of the duration for avatar deletions for users',
        buckets: [0.1, 0.3, 1.5, 5, 10],
    }),
];
