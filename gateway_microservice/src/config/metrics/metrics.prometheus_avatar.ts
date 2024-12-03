import {
    makeCounterProvider,
    makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

export const prometheusProvidersAvatar = [
    // Счётчик для загрузки аватара
    makeCounterProvider({
        name: 'UPLOAD_AVATAR_USER_TOTAL',
        help: 'Total number of avatar uploads, categorized by success or failure',
        labelNames: ['result'], // 'result' будет иметь значения 'success' или 'failure'
    }),

    // Гистограмма для измерения времени выполнения загрузки аватара
    makeHistogramProvider({
        name: 'UPLOAD_AVATAR_USER_DURATION',
        help: 'Histogram of upload avatar requests duration',
        buckets: [0.1, 0.5, 1, 2, 5, 10], // Время выполнения в секундах
    }),

    // Счётчик для поиска аватаров пользователя
    makeCounterProvider({
        name: 'FIND_USER_AVATAR_ARRAY_TOTAL',
        help: 'Total number of find avatar array requests, categorized by success or failure',
        labelNames: ['result'],
    }),

    // Гистограмма для измерения времени выполнения поиска массива аватаров
    makeHistogramProvider({
        name: 'FIND_USER_AVATAR_ARRAY_DURATION',
        help: 'Histogram of find user avatar array requests duration',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    // Счётчик для поиска конкретного аватара пользователя
    makeCounterProvider({
        name: 'FIND_USER_AVATAR_TOTAL',
        help: 'Total number of find avatar requests, categorized by success or failure',
        labelNames: ['result'],
    }),

    // Гистограмма для измерения времени выполнения поиска аватара пользователя
    makeHistogramProvider({
        name: 'FIND_USER_AVATAR_DURATION',
        help: 'Histogram of find user avatar requests duration',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    // Счётчик для удаления аватара пользователя
    makeCounterProvider({
        name: 'DELETE_AVATAR_USER_TOTAL',
        help: 'Total number of avatar delete requests, categorized by success or failure',
        labelNames: ['result'],
    }),

    // Гистограмма для измерения времени выполнения удаления аватара пользователя
    makeHistogramProvider({
        name: 'DELETE_AVATAR_USER_DURATION',
        help: 'Histogram of delete avatar user requests duration',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),
];
