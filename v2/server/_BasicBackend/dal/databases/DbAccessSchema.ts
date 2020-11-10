import Log from "../../utils/Logger";
import {AnyObject, UpdateOperation} from "./MongoAccess";

export abstract class DbAccessSchema {
    protected log: Log;

    protected constructor() {
        this.log = Log.getInstance();
    }

    abstract async initConnection<T>(): Promise<T | Error>;

    public abstract getConnection<T>(): Promise<T | Error>;

    public abstract async queryAll<T>(table: string, filter?: AnyObject | {}, query?: QueryObject): Promise<T[] | []>;

    public abstract async queryOne<T>(table: string, filter?: AnyObject | {}, query?: QueryObject): Promise<T | null>;

    public abstract async insert<U, T>(table: string, data: U | U[], oneEntry?: boolean): Promise<T | T[] | null>;

    public abstract async update<U, T>(table: string, filter: AnyObject | QueryObject, data: U, operation?: UpdateOperation): Promise<T | null>;

    public abstract async delete<T>(table: string, filter: AnyObject | QueryObject): Promise<T | null>;

    /**
     * Append multiple values in multiple db entries
     * @param table
     * @param field
     * @param data
     */
    public abstract async append<T>(table: string, field: string, data: MultiFieldData[]): Promise<T[]>;

    public abstract async reduce<T>(table: string, field: string, data: MultiFieldData[]): Promise<T[]>;

    public abstract async exists<T>(table: string, id: string): Promise<boolean>;

    public abstract toDbIDs<T>(ids: string | string[]): T[];

    public abstract initTable(table: string, columns: [string, string][]): Promise<void>;
}

/**
 *The first parameter is the query and the second the sql parameters
 */
export type QueryObject = [string, string[]];

export interface DbData {
    [key: string]: (string | number)[];
}

export interface SimpleObject {
    [key: string]: (string | number) | (string | number)[];
}

export interface MultiFieldData {
    id: string
    value: (string | number)[]
}