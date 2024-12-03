# Telegram

## Команды для запуска
- chmod +x .
- npm run dev:build

**Под команды для бд**
- docker exec -it user_microservice sh
- npx prisma migrate dev --name init - внутри контейнера user_microservice

## Monitoring
- Connection Prometheus server URL * http://prometheus:9090

## Задачи:

### Aws Or yandex.cloud
- add method for upload avatar to chat  (true)
- add method for upload avatar for user (true)


- реализовать метод отправки приглашений в чат

### Websocket
- реализовать пойск chat и user по маске имени
- При каждом действии с чатом будь то удаление пользователя выход пользователь и тд. Создавалось новое сообщение в чате

### Monitoring
- Настроить prometheus && graphana

- добавить дату рождения

добавить роуты crud Для аватара чата


- Переместить логику сохранения файла в content_microservice из user_microservice
- Настроисть cassandra
- Настроить ELK

model Avatar {
  avatar_id       Int           @id @default(autoincrement())
  user_id         Int
  avatar_url      String        @db.Text
  is_active       Boolean       @default(false)
  uploaded_at     DateTime      @default(now())
  is_random       Boolean       @default(false)
}