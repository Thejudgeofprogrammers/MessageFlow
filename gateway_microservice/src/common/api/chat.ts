import * as dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT_NGINX;
const host = process.env.HOST_NGINX;

const descriptionApiJoinCurl = `
    curl -X POST http://${host}:${port}/api/chat/6733bbd9d271a4f8cc0874ac/join/12 \
        -H "Content-Type: application/json" \
        -H "Cookie: userId=12; jwtToken=27052b**********************4f7b87" \
        -d '{
            "chatId": "6733bbd9d271a4f8cc0874ac"
        }'
`;

const descriptionApiJoinAxios = `
    await axios.post(
        'http://${host}:${port}/api/chat/6733bbd9d271a4f8cc0874ac/join/12',
        {
            chatId: '6733bbd9d271a4f8cc0874ac',
        },
        {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, // Для поддержки куки
        }
    );
`;

const JoinChatDocs = `
    Выполнить запрос для выхода из чата.\n\nПример curl:\n
    ${descriptionApiJoinCurl}\n\nПример axios:\n${descriptionApiJoinAxios}
`;

const descriptionApiLeaveCurl = `
    curl -X POST http://${host}:${port}/api/chat/6733bbd9d271a4f8cc0874ac/leave/12 \
        -H "Content-Type: application/json" \
        -H "Cookie: userId=12; jwtToken=27052b**********************4f7b87" \
        -d '{
            "chatId": "6733bbd9d271a4f8cc0874ac"
        }'
`;

const descriptionApiLeaveAxios = `
    await axios.post(
        'http://${host}:${port}/api/chat/6733bbd9d271a4f8cc0874ac/leave/12',
        {
            chatId: '6733bbd9d271a4f8cc0874ac',
        },
        {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, // Для поддержки куки
        }
    );
`;

const LeaveChatDocs = `
    Выполнить запрос для выхода из чата.\n\nПример curl:\n
    ${descriptionApiLeaveCurl}\n\nПример axios:\n${descriptionApiLeaveAxios}
`;

const descriptionApiCreateNewChatCurl = `
    curl -X POST http://${host}:${port}/api/chat/create \
        -H "Content-Type: application/json" \
        -H "Cookie: userId=12; jwtToken=27052b**********************4f7b87" \
        -d '{
            "chatName": "yourChat",
            "chatType": "private"
        }'
`;

const descriptionApiCreateNewChatAxios = `
    await axios.post(
        'http://${host}:${port}/api/chat/create',
        {
            chatName: 'yourChat',
            chatType: 'private',
        },
        {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, // Для поддержки куки
        }
    );
`;

const CreateNewChatDocs = `
    Выполнить запрос для создание нового чата.\n\nПример curl:\n
    ${descriptionApiCreateNewChatCurl}\n\nПример axios:\n${descriptionApiCreateNewChatAxios}
`;

const descriptionApiFindByIdCurl = `
    curl -X GET "http://${host}:${port}/api/chat/6733bbd9d271a4f8cc0874ac" \
        -H "Cookie: userId=12; jwtToken=27052b**********************4f7b87"
`;

const descriptionApiFindByIdAxios = `
    await axios.get(
        'http://${host}:${port}/api/chat/6733bbd9d271a4f8cc0874ac',
        {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, // Для поддержки куки
        }
    );
`;

const FindByIdDocs = `
    Выполнить запрос для поиска чата по id.\n\nПример curl:\n
    ${descriptionApiFindByIdCurl}\n\nПример axios:\n${descriptionApiFindByIdAxios}
`;

const getChatByChatNameCurl = `
    curl -X GET "http://${host}:${port}/api/chat/yourChat" \
    -H "Cookie: userId=yourUserId; jwtToken=yourJwtToken" \
    -H "Content-Type: application/json"
`;

const getChatByChatNameAxios = `
    axios.get('http://${host}:${port}/api/chat/yourChat', {
        headers: {
        'Content-Type': 'application/json',
        },
        withCredentials: true,
    })
        .then(response => console.log(response.data))
        .catch(error => console.error(error));
`;

const getChatByChatNameDocs = `
    Выполнить запрос для поиска чата по chatName.\n\nПример curl:\n
    ${getChatByChatNameCurl}\n\nПример axios:\n${getChatByChatNameAxios}
`;

const updateChatByIdCurl = `
    curl -X POST "http://${host}:${port}/api/chat/update/6733bbd9d271a4f8cc0874ac" \
    -H "Cookie: userId=yourUserId; jwtToken=yourJwtToken" \
    -H "Content-Type: application/json" \
    -d '{
            "chatId": "6733bbd9d271a4f8cc0874ac",
            "chatName": "newChatName",
            "chatType": "public",
            "description": "Updated chat information"
        }'
`;

const updateChatByIdAxios = `
    axios.post(
    'http://${host}:${port}/api/chat/update/6733bbd9d271a4f8cc0874ac',
    {
        chatId: "6733bbd9d271a4f8cc0874ac",
        chatName: "newChatName",
        chatType: "public",
        description: "Updated chat information"
    },
    {
        headers: {
        'Content-Type': 'application/json',
        },
        withCredentials: true,
    }
    )
    .then(response => console.log(response.data))
    .catch(error => console.error(error));
`;

const updateChatByIdDocs = `
    Выполнить запрос для обновления информации о чате.\n\nПример curl:\n
    ${updateChatByIdCurl}\n\nПример axios:\n${updateChatByIdAxios}
`;

const deleteChatByIdCurl = `
    curl -X POST "http://${host}:${port}/api/chat/delete/6733bbd9d271a4f8cc0874ac" \\
    -H "Cookie: userId=yourUserId; jwtToken=yourJwtToken" \\
    -H "Content-Type: application/json" \\
    -d '{
            "chatId": "6733bbd9d271a4f8cc0874ac"
        }'
`;

const deleteChatByIdAxios = `
    axios.post(
    'http://${host}:${port}/api/chat/delete/6733bbd9d271a4f8cc0874ac',
    {
        chatId: "6733bbd9d271a4f8cc0874ac"
    },
    {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    })
    .then(response => console.log(response.data))
    .catch(error => console.error(error));
`;

const deleteChatByIdDocs = `
    Выполнить запрос для удаления чата по chatId.\n\nПример curl:\n
    ${deleteChatByIdCurl}\n\nПример axios:\n${deleteChatByIdAxios}
`;

const addUserToChatCurl = `
    curl -X POST "http://${host}:${port}/api/chat/6733bbd9d271a4f8cc0874ac/add/12" \\
    -H "Cookie: userId=yourUserId; jwtToken=yourJwtToken" \\
    -H "Content-Type: application/json" \\
    -d '{
            "chatId": "6733bbd9d271a4f8cc0874ac",
            "participant": {
                "userId": 12,
                "role": "owner"
            }
        }'
`;

const addUserToChatAxios = `
    axios.post(
    'http://${host}:${port}/api/chat/6733bbd9d271a4f8cc0874ac/add/12',
    {
        chatId: "6733bbd9d271a4f8cc0874ac",
        participant: {
            userId: 12,
            role: "owner"
        }
    },
    {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    })
    .then(response => console.log(response.data))
    .catch(error => console.error(error));
`;

const addUserToChatDocs = `
    Выполнить запрос для добавления пользователя в чат.\n\nПример curl:\n
    ${addUserToChatCurl}\n\nПример axios:\n${addUserToChatAxios}
`;

const removeUserFromChatCurl = `
    curl -X POST "http://${host}:${port}/api/chat/6733bbd9d271a4f8cc0874ac/del/12" \\
    -H "Cookie: userId=yourUserId; jwtToken=yourJwtToken" \\
    -H "Content-Type: application/json" \\
    -d '{
            "chatId": "6733bbd9d271a4f8cc0874ac",
            "userId": 12
        }'
`;

const removeUserFromChatAxios = `
    axios.post(
    'http://${host}:${port}/api/chat/6733bbd9d271a4f8cc0874ac/del/12',
    {
        chatId: "6733bbd9d271a4f8cc0874ac",
        userId: 12
    },
    {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    })
    .then(response => console.log(response.data))
    .catch(error => console.error(error));
`;

const removeUserFromChatDocs = `
    Выполнить запрос для удаления пользователя из чата.\n\nПример curl:\n
    ${removeUserFromChatCurl}\n\nПример axios:\n${removeUserFromChatAxios}
`;

const kickUserFromChatCurl = `
    curl -X POST "http://${host}:${port}/api/chat/6733bbd9d271a4f8cc0874ac/12/kick" \\
    -H "Cookie: userId=yourUserId; jwtToken=yourJwtToken" \\
    -H "Content-Type: application/json" \\
    -d '{
            "chatId": "6733bbd9d271a4f8cc0874ac",
            "userId": 12,
            "participantId": 12
        }'
`;

const kickUserFromChatAxios = `
    axios.post(
    'http://${host}:${port}/api/chat/6733bbd9d271a4f8cc0874ac/12/kick',
    {
        chatId: "6733bbd9d271a4f8cc0874ac",
        userId: 12,
        participantId: 12
    },
    {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    })
    .then(response => console.log(response.data))
    .catch(error => console.error(error));
`;

const kickUserFromChatDocs = `
    Выполнить запрос для исключения пользователя из чата.\n\nПример curl:\n
    ${kickUserFromChatCurl}\n\nПример axios:\n${kickUserFromChatAxios}
`;

const permissionToMemberCurl = `
    curl -X POST "http://${host}:${port}/api/chat/6733bbd9d271a4f8cc0874ac/get/member" \\
    -H "Cookie: userId=yourUserId; jwtToken=yourJwtToken" \\
    -H "Content-Type: application/json" \\
    -d '{
            "chatId": "6733bbd9d271a4f8cc0874ac",
            "userId": 12,
            "participantId": 12
        }'
`;

const permissionToMemberAxios = `
    axios.post(
    'http://${host}:${port}/api/chat/6733bbd9d271a4f8cc0874ac/get/member',
    {
        chatId: "6733bbd9d271a4f8cc0874ac",
        userId: 12,
        participantId: 12
    },
    {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    })
    .then(response => console.log(response.data))
    .catch(error => console.error(error));
`;

const permissionToMemberDocs = `
    Выполнить запрос для изменения прав пользователя в чате.\n\nПример curl:\n
    ${permissionToMemberCurl}\n\nПример axios:\n${permissionToMemberAxios}\n\n
    Описание маршрута:\nPOST /api/chat/{chatId}/get/member\n\n
    Параметры:\n
    - chatId (string): Идентификатор чата, где необходимо изменить права участника\n
    - userId (number): Идентификатор текущего пользователя, выполняющего запрос\n
    - participantId (number): Идентификатор пользователя, которому изменяются права\n
`;

const permissionToAdminCurl = `
    curl -X POST "http://${host}:${port}/api/chat/6733bbd9d271a4f8cc0874ac/get/admin" \\
    -H "Cookie: userId=yourUserId; jwtToken=yourJwtToken" \\
    -H "Content-Type: application/json" \\
    -d '{
            "chatId": "6733bbd9d271a4f8cc0874ac",
            "userId": 12,
            "participantId": 12
        }'
`;

const permissionToAdminAxios = `
    axios.post(
    'http://${host}:${port}/api/chat/6733bbd9d271a4f8cc0874ac/get/admin',
    {
        chatId: "6733bbd9d271a4f8cc0874ac",
        userId: 12,
        participantId: 12
    },
    {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    })
    .then(response => console.log(response.data))
    .catch(error => console.error(error));
`;

const permissionToAdminDocs = `
    Выполнить запрос для предоставления прав администратора пользователю в чате.\n\nПример curl:\n
    ${permissionToAdminCurl}\n\nПример axios:\n${permissionToAdminAxios}\n\n
    Описание маршрута:\nPOST /api/chat/{chatId}/get/admin\n\n
    Параметры:\n
    - chatId (string): Идентификатор чата, в котором нужно изменить права пользователя на администратора\n
    - userId (number): Идентификатор текущего пользователя, выполняющего запрос\n
    - participantId (number): Идентификатор пользователя, которому нужно предоставить права администратора\n
`;

export const chatDescription = {
    removeUserFromChatDocs,
    addUserToChatDocs,
    deleteChatByIdDocs,
    updateChatByIdDocs,
    getChatByChatNameDocs,
    JoinChatDocs,
    CreateNewChatDocs,
    FindByIdDocs,
    LeaveChatDocs,
    kickUserFromChatDocs,
    permissionToMemberDocs,
    permissionToAdminDocs,
};
