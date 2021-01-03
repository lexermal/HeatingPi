/* eslint-disable */
import { User } from "../handler/UserHandler";
import { StaticConnectionConfig } from "knex";

export const PORT = 9000;

export const LOG_LEVEL = "debug"; // debug, info, warn, error
export const LOG_FORMAT = "YYYY-MM-DD HH:mm:ss";

export const GRAPHQL_SCHEMA_FILE = "./endpoint.graphqls";

export const DB_CONNECTION = {
    host: "127.0.0.1",
    port: 27017,
    // user: 'your_database_user',
    // password: 'your_database_password',
    database: "rueto",
    filename: "test.sqlite3"
} as StaticConnectionConfig;

export const DB_TYPE = "sqlite"; // sqlite, mongodb
export const DB_ENCRYPTION_SALT = "RwdqwqpfrM4uj5luks4WSvsv12762IJziHK6zZwgU7I2f1uQrIrdRubhwPUr";
export const DB_ENCRYPTION_PASSWORD = "7lwMCcgVcriSWcA5qqq3YmefmMWnrF34c93eU4osVnnzioYGkb7wIEFsYsdn";
export const DB_ENCRYPTION_ALGORITHM = "aes-256-cbc";
export const DB_ENCRYPTION_ALGORITHM_BYTES = 256 / 8;

export enum ROLES {
    PUBLIC = 0, // 0 = unrestricted
    USER = 1,
    MODERATOR = 2,
    ADMIN = 3
}

export const USERS = [
    {
        name: "Max Mustermann",
        email: "max@max.com",
        password: "test123",
        role: ROLES.USER
    }
] as User[];

export const DEFAULT_ROLE = ROLES.USER;

export const TOKEN_EXPIRATION = 60; // [hours]
export const TOKEN_SALT =
    "77d77757d0427cd52c32dcf1dd68ceebf713c59c126a71196b37297b398e92989706f22cfcd5eb1a09fe9d3e42d1d24917ff5a2d3b2bfa62205a1ddf67c43ee9";
