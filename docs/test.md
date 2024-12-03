# Тесты api/auth

curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d '{

    "username": "testuser",
    "email": "testuse32523r@example.com",
    "password": "securepassword",
    "phoneNumber": "1234527890"
}'
{"message":"User created","status":201}

curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{
    "password": "securepassword",
    "phoneNumber": "1234527890"
}'
{    
    "userId":1,
    "jwtToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdHVzZTMyNTIzckBleGFtcGxlLmNvbSIsImlhdCI6MTczMDkyMDA3MCwiZXhwIjoxNzMwOTIzNjcwfQ.f4a0t1njy1ByNNjNS7fJv1EZHMteCX_1ScRkokwjtCo",
}

curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{
    "password": "securepassword",
    "email": "testuse32523r@example.com"
}'
{    
    "userId":1,
    "jwtToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdHVzZTMyNTIzckBleGFtcGxlLmNvbSIsImlhdCI6MTczMDkyMDA3MCwiZXhwIjoxNzMwOTIzNjcwfQ.f4a0t1njy1ByNNjNS7fJv1EZHMteCX_1ScRkokwjtCo",
}

curl -X POST http://localhost:8080/api/auth/logout -H "Content-Type: application/json" -d '{
    "userId":1,
    "jwtToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdHVzZTMyNTIzckBleGFtcGxlLmNvbSIsImlhdCI6MTczMDkyMDA3MCwiZXhwIjoxNzMwOTIzNjcwfQ.f4a0t1njy1ByNNjNS7fJv1EZHMteCX_1ScRkokwjtCo",
}'
{"message":"User session deleted successfully","status":200}


curl -X GET "http://localhost:8080/api/user/findByEmail?email=testuse32523r@example.com" -H "Content-Type: application/json"

{"userId":1,"jwtToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdHVzZTMyNTIzckBleGFtcGxlLmNvbSIsImlhdCI6MTczMDkyMjg4MSwiZXhwIjoxNzMwOTI2NDgxfQ.-ogERiJKVsTFW_wvzv2LKG3nnQGDdeW4Lp4hcrsS6NY"}

curl -X GET "http://localhost:8080/api/user/findByEmail?email=testuse32523r@example.com" \
-H "Content-Type: application/json" \
-b "userId=1; jwtToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdHVzZTMyNTIzckBleGFtcGxlLmNvbSIsImlhdCI6MTczMDkyMzI2MywiZXhwIjoxNzMwOTI2ODYzfQ.WviWuQqpuM2X_6lhwmTq47PIaA_9v41JQoVl--n4wFo"