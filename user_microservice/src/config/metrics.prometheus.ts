import {
    makeCounterProvider,
    makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

export const prometheusProviders = [
    makeCounterProvider({
        name: 'TOGGLE_USER_PROFILE_CHECK_TOTAL',
        help: 'Total number of toggle profile check requests, categorized by success or failure',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'TOGGLE_USER_PROFILE_CHECK_DURATION',
        help: 'Histogram of toggle profile check request durations',
        buckets: [0.1, 0.5, 1, 2, 5],
    }),
    makeCounterProvider({
        name: 'UPDATE_USER_PROFILE_TOTAL',
        help: 'Total number of update profile requests, categorized by success or failure',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'UPDATE_USER_PROFILE_DURATION',
        help: 'Histogram of update profile request durations',
        buckets: [0.1, 0.5, 1, 2, 5],
    }),
    makeCounterProvider({
        name: 'GET_USER_PROFILE_TOTAL',
        help: 'Total number of GetUserProfile requests, categorized by success or failure',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'GET_USER_PROFILE_DURATION',
        help: 'Histogram of GetUserProfile request durations',
        buckets: [0.1, 0.5, 1, 2, 5],
    }),
    makeCounterProvider({
        name: 'UPDATE_USER_PASSWORD_TOTAL',
        help: 'Total number of UpdateUserPassword requests, categorized by success or failure',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'UPDATE_USER_PASSWORD_DURATION',
        help: 'Histogram of UpdateUserPassword request durations',
        buckets: [0.1, 0.5, 1, 2, 5],
    }),
    makeCounterProvider({
        name: 'GET_PASSWORD_USER_TOTAL',
        help: 'Total number of GetPasswordUser requests, categorized by success or failure',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'GET_PASSWORD_USER_DURATION',
        help: 'Histogram of GetPasswordUser request durations',
        buckets: [0.1, 0.5, 1, 2, 5],
    }),
    makeCounterProvider({
        name: 'REMOVE_ACCOUNT_TOTAL',
        help: 'Total number of RemoveAccount requests, categorized by success or failure',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'REMOVE_ACCOUNT_DURATION',
        help: 'Histogram of RemoveAccount request durations',
        buckets: [0.1, 0.5, 1, 2, 5],
    }),
    makeCounterProvider({
        name: 'REMOVE_ARRAY_CHAT_TOTAL',
        help: 'Total number of RemoveArrayChat requests, categorized by success or failure',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'REMOVE_ARRAY_CHAT_DURATION',
        help: 'Histogram of RemoveArrayChat request durations',
        buckets: [0.1, 0.5, 1, 2, 5],
    }),
    makeCounterProvider({
        name: 'ADD_CHAT_TO_USER_TOTAL',
        help: 'Total number of AddChatToUser requests, categorized by success or failure',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'ADD_CHAT_TO_USER_DURATION',
        help: 'Histogram of AddChatToUser request durations',
        buckets: [0.1, 0.5, 1, 2, 5],
    }),
    makeCounterProvider({
        name: 'REMOVE_CHAT_FROM_USER_TOTAL',
        help: 'Total number of RemoveChatFromUser requests, categorized by success or failure',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'REMOVE_CHAT_FROM_USER_DURATION',
        help: 'Histogram of RemoveChatFromUser request durations',
        buckets: [0.1, 0.5, 1, 2, 5],
    }),
    makeCounterProvider({
        name: 'CREATE_NEW_USER_TOTAL',
        help: 'Total number of CreateNewUser requests, categorized by success or failure',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'CREATE_NEW_USER_DURATION',
        help: 'Histogram of CreateNewUser request durations',
        buckets: [0.1, 0.5, 1, 2, 5],
    }),
    makeCounterProvider({
        name: 'FIND_USER_BY_ID_TOTAL',
        help: 'Total number of FindUserById requests, categorized by success or failure',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'FIND_USER_BY_ID_DURATION',
        help: 'Histogram of FindUserById request durations',
        buckets: [0.1, 0.5, 1, 2, 5],
    }),
    makeCounterProvider({
        name: 'FIND_USER_BY_USERNAME_TOTAL',
        help: 'Total number of FindUserByUsername requests, categorized by success or failure',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'FIND_USER_BY_USERNAME_DURATION',
        help: 'Histogram of FindUserByUsername request durations',
        buckets: [0.1, 0.5, 1, 2, 5],
    }),
    makeCounterProvider({
        name: 'FIND_USER_BY_EMAIL_TOTAL',
        help: 'Total number of FindUserByEmail requests, categorized by success or failure',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'FIND_USER_BY_EMAIL_DURATION',
        help: 'Histogram of FindUserByEmail request durations',
        buckets: [0.1, 0.5, 1, 2, 5],
    }),
    makeCounterProvider({
        name: 'FIND_USER_BY_PHONE_TOTAL',
        help: 'Total number of FindUserByPhoneNumber requests, categorized by success or failure',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'FIND_USER_BY_PHONE_DURATION',
        help: 'Histogram of FindUserByPhoneNumber request durations',
        buckets: [0.1, 0.5, 1, 2, 5],
    }),
];
