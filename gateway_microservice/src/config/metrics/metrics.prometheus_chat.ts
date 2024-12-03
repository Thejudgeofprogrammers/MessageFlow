import {
    makeCounterProvider,
    makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

export const prometheusProvidersChat = [
    // Счётчик для запросов на предоставление прав администратора
    makeCounterProvider({
        name: 'PERMISSION_TO_ADMIN_TOTAL',
        help: 'Total number of PermissionToAdmin requests, categorized by success or failure',
        labelNames: ['result'], // 'result' будет иметь значения 'success' или 'failure'
    }),

    // Гистограмма для измерения времени выполнения запросов на предоставление прав администратора
    makeHistogramProvider({
        name: 'PERMISSION_TO_ADMIN_DURATION',
        help: 'Duration of PermissionToAdmin requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10], // Время выполнения в секундах
    }),

    // Счётчик для запросов на предоставление прав участника
    makeCounterProvider({
        name: 'PERMISSION_TO_MEMBER_TOTAL',
        help: 'Total number of PermissionToMember requests, categorized by success or failure',
        labelNames: ['result'],
    }),

    // Гистограмма для измерения времени выполнения запросов на предоставление прав участника
    makeHistogramProvider({
        name: 'PERMISSION_TO_MEMBER_DURATION',
        help: 'Duration of PermissionToMember requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    // Счётчик для запросов на загрузку в чат
    makeCounterProvider({
        name: 'LOAD_TO_CHAT_TOTAL',
        help: 'Total number of LoadToChat requests, categorized by success or failure',
        labelNames: ['result'],
    }),

    // Гистограмма для измерения времени выполнения запросов на загрузку в чат
    makeHistogramProvider({
        name: 'LOAD_TO_CHAT_DURATION',
        help: 'Duration of LoadToChat requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    // Счётчик для запросов на выход из чата
    makeCounterProvider({
        name: 'LEAVE_FROM_CHAT_TOTAL',
        help: 'Total number of LeaveFromChat requests, categorized by success or failure',
        labelNames: ['result'],
    }),

    // Гистограмма для измерения времени выполнения запросов на выход из чата
    makeHistogramProvider({
        name: 'LEAVE_FROM_CHAT_DURATION',
        help: 'Duration of LeaveFromChat requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    // Счётчик для запросов на создание нового чата
    makeCounterProvider({
        name: 'CREATE_NEW_CHAT_TOTAL',
        help: 'Total number of CreateNewChat requests, categorized by success or failure',
        labelNames: ['result'],
    }),

    // Гистограмма для измерения времени выполнения запросов на создание нового чата
    makeHistogramProvider({
        name: 'CREATE_NEW_CHAT_DURATION',
        help: 'Duration of CreateNewChat requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    // Счётчик для запросов на получение чата по ID
    makeCounterProvider({
        name: 'GET_CHAT_BY_ID_TOTAL',
        help: 'Total number of GetChatById requests, categorized by success or failure',
        labelNames: ['result'],
    }),

    // Гистограмма для измерения времени выполнения запросов на получение чата по ID
    makeHistogramProvider({
        name: 'GET_CHAT_BY_ID_DURATION',
        help: 'Duration of GetChatById requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    // Счётчик для запросов на получение чата по имени
    makeCounterProvider({
        name: 'GET_CHAT_BY_CHAT_NAME_TOTAL',
        help: 'Total number of GetChatByChatName requests, categorized by success or failure',
        labelNames: ['result'],
    }),

    // Гистограмма для измерения времени выполнения запросов на получение чата по имени
    makeHistogramProvider({
        name: 'GET_CHAT_BY_CHAT_NAME_DURATION',
        help: 'Duration of GetChatByChatName requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    // Счётчик для запросов на обновление чата по ID
    makeCounterProvider({
        name: 'UPDATE_CHAT_BY_ID_TOTAL',
        help: 'Total number of UpdateChatById requests, categorized by success or failure',
        labelNames: ['result'],
    }),

    // Гистограмма для измерения времени выполнения запросов на обновление чата по ID
    makeHistogramProvider({
        name: 'UPDATE_CHAT_BY_ID_DURATION',
        help: 'Duration of UpdateChatById requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    // Счётчик для запросов на удаление чата по ID
    makeCounterProvider({
        name: 'DELETE_CHAT_BY_ID_TOTAL',
        help: 'Total number of DeleteChatById requests, categorized by success or failure',
        labelNames: ['result'],
    }),

    // Гистограмма для измерения времени выполнения запросов на удаление чата по ID
    makeHistogramProvider({
        name: 'DELETE_CHAT_BY_ID_DURATION',
        help: 'Duration of DeleteChatById requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    // Счётчик для запросов на кик из чата
    makeCounterProvider({
        name: 'KICK_CHAT_TOTAL',
        help: 'Total number of kickChat requests, categorized by success or failure',
        labelNames: ['result'],
    }),

    // Гистограмма для измерения времени выполнения запросов на кик из чата
    makeHistogramProvider({
        name: 'KICK_CHAT_DURATION',
        help: 'Duration of kickChat requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),
];
