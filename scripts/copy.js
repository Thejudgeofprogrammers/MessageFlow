const fs = require('fs-extra');
const path = require('path');

const microservices = [
    '../session_microservice',
    '../user_microservice',
    '../auth_microservice',
    '../gateway_microservice',
    '../chat_microservice',
    '../content_microservice'
];

const sourceDir = path.join(__dirname, '../protos');
const destinationDir = 'protos';

async function copyProtos() {
    for (const microservice of microservices) {
        const targetDir = path.join(__dirname, microservice, 'src', destinationDir);

        try {
            await fs.remove(targetDir);
            await fs.copy(sourceDir, targetDir);
            console.log(`Копирование в ${targetDir} выполнено.`);
        } catch (err) {
            console.error(`Ошибка при копировании в ${targetDir}:`, err);
        }
    }
}

copyProtos();