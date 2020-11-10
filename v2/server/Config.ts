export const PORT = 9000;

export const LOG_LEVEL = "debug"; //debug, info, warn, error
export const LOG_FORMAT = "YYYY-MM-DD HH:mm:ss";

export const GRAPHQL_SCHEMA_FILE = "./customized/api/endpoint.graphqls";

export const MONGODB_DB = "Rueto";
export const MONGODB_URL = "mongodb://localhost:27017";

export enum DB_TABLES {
    TAG = "tag",
    FILE = "file",
    ENTRY = "entry",
    FIELD = "field",
    REGEX = "regex",
    SOURCE = "source",
    CATEGORY = "category",
}

export const DB_TYPE="sqllite"; //sqllite, mongodb