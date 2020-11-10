import {ObjectId} from "mongodb";
import {DB_TYPE} from "../../Config";
import MongoAccess, {AnyObject} from "./databases/MongoAccess";
import {UnknownObject} from "../handlerCreation/HandlerGenerator";
import {DbAccessSchema, MultiFieldData, QueryObject, SimpleObject} from "./databases/DbAccessSchema";
import SqlliteAccess from "./databases/SqlliteAccess";

export enum AvailableDatabases {
    MongoDB = "mongodb",
    SQLLite = "sqllite"
}

export class Connector {
    private static _instance: Connector;
    private connection: DbAccessSchema | Error;
    private static initiatedTables = [] as string[];

    private constructor() {
        this.connection = this.getDatabaseClass(DB_TYPE);
    }

    private getDatabaseClass(db: string): DbAccessSchema | Error {
        switch (db) {
            case AvailableDatabases.MongoDB:
                return new MongoAccess();
            case AvailableDatabases.SQLLite:
                return new SqlliteAccess();
            default:
                return new Error("The database connector does not exist")
        }
    }

    public static getDatabase() {
        if (!this._instance) {
            this._instance = new this();
        }

        return this._instance.connection;
    }

    public static initTable(table: string, columns: [string, string][]): Promise<void> {
        if (this.initiatedTables.includes(table)) {
            return Promise.resolve(undefined);
        }

        return (this._instance.connection as DbAccessSchema).initTable(table, columns).then(() => {
            this.initiatedTables.push(table);
        });
    }
}

export default class DB_Abstractor {
    private readonly table: string;
    private db: DbAccessSchema;

    constructor(table: string, columns?: [string, string][]) {
        this.table = table;
        const connection = Connector.getDatabase();

        if (connection instanceof Error) {
            throw connection;
        }
        this.db = connection;
        Connector.initTable(table, columns || []);
    }

    public async query(filter?: AnyObject | {}, query?: QueryObject, oneEntry?: boolean): Promise<UnknownObject | UnknownObject[] | null> {
        if (oneEntry) {
            return await this.db.queryOne<UnknownObject>(this.table, filter, query);
        }

        return await this.db.queryAll<UnknownObject>(this.table, filter, query);
    }

    public async insert(data: SimpleObject, onEntry?: boolean): Promise<SimpleObject | null> {
        return await this.db.insert<SimpleObject, SimpleObject>(this.table, data, onEntry) as unknown as Promise<SimpleObject>;
    }

    public async update(filter: AnyObject | QueryObject, data: UnknownObject): Promise<UnknownObject | UnknownObject[] | null> {
        return await this.db.update(this.table, filter, data);
    }

    public async append(field: string, data: MultiFieldData[]) {
        return await this.db.append(this.table, field, data);
    }

    public async reduce(field: string, data: MultiFieldData[]) {
        return await this.db.reduce(this.table, field, data);
    }

    public async delete(filter: AnyObject | QueryObject): Promise<UnknownObject | null> {
        const result = await this.db.delete<{ data: UnknownObject; id: string }>(this.table, filter);

        return result ? {...result.data, id: result.id} : null;
    }

    public toDbIDs<T>(ids: string[]): ObjectId[] {
        return this.db.toDbIDs(ids);
    }

    public toDbID<T>(ids: string): ObjectId {
        return this.db.toDbIDs<ObjectId>([ids])[0];
    }

    public async exists<T>(id: string): Promise<boolean> {
        return this.db.exists(this.table, id);
    }
}


