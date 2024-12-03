import {
    makeCounterProvider,
    makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

export const prometheusProvidersUser = [
    // Счётчик для общего числа запросов на обновление профиля пользователя
    makeCounterProvider({
        name: 'UPDATE_USER_PROFILE_TOTAL',
        help: 'Total number of update user profile requests',
    }),

    // Гистограмма для измерения времени выполнения запросов на обновление профиля пользователя
    makeHistogramProvider({
        name: 'UPDATE_USER_PROFILE_DURATION',
        help: 'Duration of update user profile requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10], // Время в секундах
    }),

    // Счётчик для общего числа запросов на получение профиля пользователя
    makeCounterProvider({
        name: 'GET_USER_PROFILE_TOTAL',
        help: 'Total number of get user profile requests',
    }),

    // Гистограмма для измерения времени выполнения запросов на получение профиля пользователя
    makeHistogramProvider({
        name: 'GET_USER_PROFILE_DURATION',
        help: 'Duration of get user profile requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    // Счётчик для общего числа запросов на обновление пароля пользователя
    makeCounterProvider({
        name: 'UPDATE_USER_PASSWORD_TOTAL',
        help: 'Total number of update user password requests',
    }),

    // Гистограмма для измерения времени выполнения запросов на обновление пароля пользователя
    makeHistogramProvider({
        name: 'UPDATE_USER_PASSWORD_DURATION',
        help: 'Duration of update user password requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    // Счётчик для общего числа запросов на поиск пользователя по ID
    makeCounterProvider({
        name: 'FIND_USER_BY_ID_TOTAL',
        help: 'Total number of find user by ID requests',
    }),

    // Гистограмма для измерения времени выполнения запросов на поиск пользователя по ID
    makeHistogramProvider({
        name: 'FIND_USER_BY_ID_DURATION',
        help: 'Duration of find user by ID requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    // Счётчик для общего числа запросов на поиск пользователя по телефону
    makeCounterProvider({
        name: 'FIND_USER_BY_PHONE_TOTAL',
        help: 'Total number of find user by phone requests',
    }),

    // Гистограмма для измерения времени выполнения запросов на поиск пользователя по телефону
    makeHistogramProvider({
        name: 'FIND_USER_BY_PHONE_DURATION',
        help: 'Duration of find user by phone requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    // Счётчик для общего числа запросов на поиск пользователя по email
    makeCounterProvider({
        name: 'FIND_USER_BY_EMAIL_TOTAL',
        help: 'Total number of find user by email requests',
    }),

    // Гистограмма для измерения времени выполнения запросов на поиск пользователя по email
    makeHistogramProvider({
        name: 'FIND_USER_BY_EMAIL_DURATION',
        help: 'Duration of find user by email requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    // Счётчик для общего числа запросов на поиск пользователя по имени пользователя
    makeCounterProvider({
        name: 'FIND_USER_BY_USERNAME_TOTAL',
        help: 'Total number of find user by username requests',
    }),

    // Гистограмма для измерения времени выполнения запросов на поиск пользователя по имени пользователя
    makeHistogramProvider({
        name: 'FIND_USER_BY_USERNAME_DURATION',
        help: 'Duration of find user by username requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),
];
