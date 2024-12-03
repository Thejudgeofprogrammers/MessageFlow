# **Microservice: Gateway**

## **1. SaveUserSession**

### **Сохранение сессии пользователя в Redis**
- **gRPC Method**: `SaveUserSession`
- **Service**: `SessionService`

#### **Запрос:** `SaveUserSessionRequest`
```protobuf
message SaveUserSessionRequest {
  int32 user_id = 1;
  string jwt_token = 2;
}
```
#### **Ответ:** `SaveUserSessionResponse`
```protobuf
message SaveUserSessionResponse {
  string message = 1;
}
```

#### **Ошибки:**

- **InvalidArgument (400)**: Неверные входные данные
- **Unauthenticated (401)**: Неправильные учетные данные
- **Internal (500)**: Ошибка сервера


## **2. GetUserSession**

### **Получение сессии пользователя из Redis**
- **gRPC Method**: `GetUserSession`
- **Service**: `SessionService`

#### **Запрос:** `GetUserSessionRequest`
```protobuf
message GetUserSessionRequest {
  int32 user_id = 1;
}
```
#### **Ответ:** `GetUserSessionResponse`
```protobuf
message GetUserSessionResponse {
  int32 user_id = 1;
  string jwt_token = 2;
}
```

#### **Ошибки:**

- **InvalidArgument (400)**: Неверные входные данные
- **Unauthenticated (401)**: Неправильные учетные данные
- **Internal (500)**: Ошибка сервера


## **3. DeleteUserSession**

### **Удаление сессии пользователя из Redis**
- **gRPC Method**: `DeleteUserSession`
- **Service**: `SessionService`

#### **Запрос:** `DeleteUserSessionRequest`
```protobuf
message DeleteUserSessionRequest {
  int32 user_id = 1;
}
```
#### **Ответ:** `DeleteUserSessionResponse`
```protobuf
message DeleteUserSessionResponse {
  string message = 1;
}
```

#### **Ошибки:**

- **InvalidArgument (400)**: Неверные входные данные
- **Unauthenticated (401)**: Неправильные учетные данные
- **Internal (500)**: Ошибка сервера