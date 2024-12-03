import * as dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT_NGINX;
const host = process.env.HOST_NGINX;

const findUserByIdCurl = `
    curl -X GET "http://${host}:${port}/api/user/12" \\
    -H "Cookie: userId=yourUserId; jwtToken=yourJwtToken" \\
    -H "Content-Type: application/json"
`;

const findUserByIdAxios = `
    axios.get(
    'http://${host}:${port}/api/user/12',
    {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    })
    .then(response => console.log(response.data))
    .catch(error => console.error(error));
`;

const findUserByIdDocs = `
    Выполнить запрос для поиска пользователя по ID.\n\nПример curl:\n
    ${findUserByIdCurl}\n\nПример axios:\n${findUserByIdAxios}
`;

const findUserByPhoneCurl = `
    curl -X GET "http://${host}:${port}/api/user/+123456789" \\
    -H "Cookie: userId=yourUserId; jwtToken=yourJwtToken" \\
    -H "Content-Type: application/json"
`;

const findUserByPhoneAxios = `
    axios.get(
    'http://${host}:${port}/api/user/+123456789',
    {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    })
    .then(response => console.log(response.data))
    .catch(error => console.error(error));
`;

const findUserByPhoneDocs = `
    Выполнить запрос для поиска пользователя по номеру телефона.\n\nПример curl:\n
    ${findUserByPhoneCurl}\n\nПример axios:\n${findUserByPhoneAxios}
`;

const findUserByEmailCurl = `
    curl -X GET "http://${host}:${port}/api/user/example@mail.ru" \
    -H "Cookie: userId=yourUserId; jwtToken=yourJwtToken" \
    -H "Content-Type: application/json"
`;

const findUserByEmailAxios = `
    axios.get(
        'http://${host}:${port}/api/user/example@mail.ru',
        {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        })
        .then(response => console.log(response.data))
        .catch(error => console.error(error));
`;

const findUserByEmailDocs = `
    Выполнить запрос для поиска пользователя по email.\n\nПример curl:\n
    ${findUserByEmailCurl}\n\nПример axios:\n${findUserByEmailAxios}
`;

const findUserByUsernameCurl = `
    curl -X GET "http://${host}:${port}/api/user/lilwiggha" \
    -H "Cookie: userId=yourUserId; jwtToken=yourJwtToken" \
    -H "Content-Type: application/json"
`;

const findUserByUsernameAxios = `
    axios.get(
        'http://${host}:${port}/api/user/lilwiggha',
        {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        })
        .then(response => console.log(response.data))
        .catch(error => console.error(error));
`;

const findUserByUsernameDocs = `
    Выполнить запрос для поиска пользователя по username.\n\nПример curl:\n
    ${findUserByUsernameCurl}\n\nПример axios:\n${findUserByUsernameAxios}
`;

export const userDescription = {
    findUserByUsernameDocs,
    findUserByEmailDocs,
    findUserByPhoneDocs,
    findUserByIdDocs,
    updateUserProfile: '',
    findUserById: '',
    getUserProfile: '',
    updateUserPassword: '',
};
