# **gRPC Microservice: Auth**

## **1. Registry**

### **Регистрация нового пользователя**
- **gRPC Method**: `Register`
- **Service**: `AuthService`

#### **Запрос:** `RegisterRequest`

```protobuf
message RegisterRequest {
    string username = 1;
    string email = 2;
    string password_hash = 3;
    string phone_number = 4;
}
```

#### **Ответ:** `RegisterResponse`
```protobuf
message RegisterResponse {
    string message = 1; // "User registered successfully"
    int32 status = 2;   // 201
}
```

#### **Ошибки:**

- **InvalidArgument (400)**: Неверные входные данные
- **Internal (500)**: Ошибка сервера

## **2. Login**

### **Авторизация и аутентификация пользователя**

- **gRPC Method**: `Login`
- **Service**: `AuthService`

#### **Запрос:** `LoginRequest`
```protobuf
message LoginRequest {
    string phone_number = 1; // либо phone_number
    string email = 2;        // либо email
    string password_hash = 3;
}
```
#### **Ответ:** `LoginResponse`
```protobuf
message LoginResponse {
    int32 user_id = 1;
    string jwt_token = 2;
}
```
#### **Cookie:**
- `user_id`: хранит идентификатор пользователя
- `jwt-token`: хранит JWT токен

#### **Session:**
- `user_id`: хранит идентификатор пользователя
- `jwt-token`: хранит JWT токен

#### **Ошибки:**
- **InvalidArgument (400)**: Неверные входные данные
- **Unauthenticated (401)**: Неправильные учетные данные
- **NotFound (404)**: Пользователь не найден
- **Internal (500)**: Ошибка сервера

## **3. Logout**

### **Завершение сессии пользователя**

- **gRPC Method**: `Logout`
- **Service**: `AuthService`

#### **Запрос:** `LogoutRequest`
```protobuf
message LogoutRequest {
    int32 user_id = 1;
}
```
#### **Ответ:** `LogoutResponse`
```protobuf
message LogoutResponse {
    string message = 1; // "User logout successfully"
    int32 status = 2;   // 200
}
```
Ошибки:
- **InvalidArgument (400)**: Неверные входные данные
- **Internal (500)**: Ошибка сервера