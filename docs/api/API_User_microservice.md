# **gRPC Microservice: User**

## **1. FindUserById**

### **Поиск пользователя по user_id
- **gRPC Method**: `FindUserById`
- **Service**: `UserService`

#### **Запрос:** `FindUserByIdRequest`
```protobuf
message FindUserByIdRequest {
    int32 user_id = 1;
}
```

#### **Ответ:** `FindUserByIdResponse`
```protobuf
message FindUserByIdResponse {
    int32 user_id = 1;
    string phone_number = 2;
    string email = 3;
    string password_hash = 4;
}
```

#### **Ошибки:**

- **InvalidArgument (400)**: Неверные входные данные
- **Unauthenticated (401)**: Неавторизованный пользователь
- **NotFound (404)**: Пользователь не найден
- **Internal (500)**: Ошибка сервера


## **2. FindUserProfile**

### **Поиск профиля пользователя по user_id**
- **gRPC Method**: `FindUserProfile`
- **Service**: `UserService`

#### **Запрос:** `FindUserProfileRequest`
```protobuf
message FindUserProfileRequest {
    int32 user_id = 1;
}
```

#### **Ответ:** `FindUserProfileResponse`
```protobuf
message FindUserProfileResponse {
    int32 user_id = 1;
    string description = 2;
    string created_at = 3;
    string last_login = 4;
}
```

#### **Ошибки:**

- **InvalidArgument (400)**: Неверные входные данные
- **Unauthenticated (401)**: Неавторизованный пользователь
- **NotFound (404)**: Пользователь не найден
- **Internal (500)**: Ошибка сервера


## **3. FindUserAvatars**

### **Поиск аватаров пользователя по user_id**
- **gRPC Method**: `FindUserAvatars`
- **Service**: `UserService`

#### **Запрос:** `FindUserAvatarsRequest`
```protobuf
message FindUserAvatarsRequest {
    int32 user_id = 1;
}
```

#### **Ответ:** `FindUserAvatarsResponse`
```protobuf
message Avatar {
    int32 user_id = 1;
    string avatar_id = 2;
    string avatar_url = 3;
    bool is_active = 4;
}

message FindUserAvatarsResponse {
    repeated Avatar avatars = 1;
}
```

#### **Ошибки:**
- **InvalidArgument (400)**: Неверные входные данные
- **Unauthenticated (401)**: Неавторизованный пользователь
- **NotFound (404)**: Пользователь не найден
- **Internal (500)**: Ошибка сервера


## **4. FindUserByUsername**

### **Поиск пользователя по username**
- **gRPC Method**: FindUserByUsername
- **Service**: UserService

#### **Запрос:** `FindUserByUsernameRequest`
```protobuf
message FindUserByUsernameRequest {
    string username = 1;
}
```

#### **Ответ:** `FindUserByUsernameResponse`
```protobuf
message FindUserByUsernameResponse {
    repeated int32 user_ids = 1;
}
```

#### **Ошибки:**
- **InvalidArgument (400)**: Неверные входные данные
- **Unauthenticated (401)**: Неавторизованный пользователь
- **NotFound (404)**: Пользователь не найден
- **Internal (500)**: Ошибка сервера


## **6. FindUserByEmail**
### **Поиск пользователя по email**
- **gRPC Method**: `FindUserByEmail`
- **Service**: `UserService`

#### **Запрос:** `FindUserByEmailRequest`
```protobuf
message FindUserByEmailRequest {
    string email = 1;
}
```
#### **Ответ:** `FindUserByEmailResponse`
```protobuf
message FindUserByEmailResponse {
    int32 user_id = 1;
}
```
#### **Ошибки:**

- **InvalidArgument (400)**: Неверные входные данные
- **Unauthenticated (401)**: Неавторизованный пользователь
- **NotFound (404)**: Пользователь не найден
- **Internal (500)**: Ошибка сервера


## **7. FindUserByPhoneNumber**

### **Поиск пользователя по номеру телефона**
- **gRPC Method**: `FindUserByPhoneNumber`
- **Service**: `UserService`

#### **Запрос:** `FindUserByPhoneNumberRequest`
```protobuf
message FindUserByPhoneNumberRequest {
    string phone_number = 1;
}
```

#### **Ответ:** `FindUserByPhoneNumberResponse`
```protobuf
message FindUserByPhoneNumberResponse {
    int32 user_id = 1;
}
```

#### **Ошибки:**

- **InvalidArgument (400)**: Неверные входные данные
- **Unauthenticated (401)**: Неавторизованный пользователь
- **NotFound (404)**: Пользователь не найден
- **Internal (500)**: Ошибка сервера



## **8. UpdateUserProfile**
### **Изменение профиля пользователя**
- **gRPC Method**: `UpdateUserProfile`
- **Service**: `UserService`

#### **Запрос:** `UpdateUserProfileRequest`
```protobuf
message UpdateUserProfileRequest {
    int32 user_id = 1;
    string description = 2;
}
```

#### **Ответ:** `UpdateUserProfileResponse`
```protobuf
message UpdateUserProfileResponse {
    string message = 1; // "Successful update description"
}
```

#### **Ошибки:**

- **InvalidArgument (400)**: Неверные входные данные
- **Unauthenticated (401)**: Неавторизованный пользователь
- **NotFound (404)**: Пользователь не найден
- **Internal (500)**: Ошибка сервера


## **9. UpdateUserPassword**

### **Изменение пароля пользователя**
- **gRPC Method**: `UpdateUserPassword`
- **Service**: `UserService`

#### **Запрос:** `UpdateUserPasswordRequest`
```protobuf
message UpdateUserPasswordRequest {
    int32 user_id = 1;
    string password = 2;
}
```

#### **Ответ:** `UpdateUserPasswordResponse`
```protobuf
message UpdateUserPasswordResponse {
    string message = 1; // "Successful update user password"
}
```

#### **Ошибки:**

- **InvalidArgument (400)**: Неверные входные данные
- **Unauthenticated (401)**: Неавторизованный пользователь
- **NotFound (404)**: Пользователь не найден
- **Internal (500)**: Ошибка сервера


## **10. AddAvatarToUser**

### **Добавление аватара пользователя**
- **gRPC Method**: `AddAvatarToUser`
- **Service**: `UserService`

#### **Запрос:** `AddAvatarToUserRequest`
```protobuf
message AddAvatarToUserRequest {
    int32 user_id = 1;
}
```

#### **Ответ:** `AddAvatarToUserResponse`
```protobuf
message Avatar {
    int32 user_id = 1;
    string avatar_id = 2;
    string avatar_url = 3;
    bool is_active = 4;
}

message AddAvatarToUserResponse {
    repeated Avatar avatars = 1; // от 0 до ... объектов
}
```

#### **Ошибки:**
- **InvalidArgument (400)**: Неверные входные данные
- **Unauthenticated (401)**: Неавторизованный пользователь
- **NotFound (404)**: Пользователь не найден
- **Internal (500)**: Ошибка сервера


## **11. DeleteAvatarUser**

### **Удаление аватара пользователя**
- **gRPC Method**: `DeleteAvatarUser`
- **Service**: `UserService`

#### **Запрос:** `DeleteAvatarUserRequest`
```protobuf
message DeleteAvatarUserRequest {
    int32 user_id = 1;
    string avatar_id = 2;
}
```

#### **Ответ:** `DeleteAvatarUserResponse`
```protobuf
message DeleteAvatarUserResponse {
    string message = 1; // "Successful delete avatar"
}
```

#### **Ошибки:**
- **InvalidArgument (400)**: Неверные входные данные
- **Unauthenticated (401)**: Неавторизованный пользователь
- **NotFound (404)**: Пользователь не найден
- **Internal (500)**: Ошибка сервера