auth_microservice.port = 50051
auth_microservice.package = auth

user_microservice.port = 50052
user_microservice.package = user

session_microservice.port = 50053
session_microservice.package = session_user

gateway.port=5050

GRPC_*<Имя>*_MODULE = ../../../../protos/*<Имя>*.proto
GRPC_*<Имя>*_PATH_MAIN=../../protos/*<Имя>*.proto
