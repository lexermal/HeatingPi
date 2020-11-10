import {v4 as uuid} from 'uuid';
import * as sqlite3 from "sqlite3";
import {Database, open} from 'sqlite';
import {AnyObject} from "./MongoAccess";
import {UnknownObject} from "../../handlerCreation/HandlerGenerator";
import {DbAccessSchema, DbData, MultiFieldData, QueryObject, SimpleObject} from "./DbAccessSchema";

export default class SqlliteAccess extends DbAccessSchema {
    private readonly connection: Promise<Database | Error>;

    constructor() {
        super();
        this.connection = this.initConnection();
    }

    async initTable(table: string, columns: [string, string][]) {
        await (await this.connection as Database).exec(`CREATE TABLE ${table} (col TEXT)`)
    }

    async initConnection<Database>(): Promise<Database | Error> {
        if (this.connection) {
            return this.connection as Promise<Error | Database>;
        }

        return open({
            filename: '/tmp/database.db',
            driver: sqlite3.Database
        }).then((client) => {
            this.log.info("Successfully connected to sqllite.");

            return client as unknown as Database;
        }).catch((reason) => {
            throw new Error("Error accrued while accessing the database. " + reason.message);
        });
    }

    getConnection<Database>(): Promise<Error | Database> {
        return this.initConnection();
    }

    async append<T>(table: string, field: string, data: MultiFieldData[]): Promise<T[]> {

        const dbData = await this.queryAll<SimpleObject>(table, data.map(value => ({id: value.id})));

        return await Promise.all(
            data.map(async (fieldItem) => {

                const dbFieldData = dbData.filter((value) => value.id === fieldItem.id)[0] as DbData;
                const newItems = fieldItem.value.filter((v) => !dbFieldData[field].includes(v));

                if (newItems.length === 0) {
                    return dbData;
                }

                return await this.update(table, {id: fieldItem.id}, [...dbFieldData[field], ...newItems]);
            })
        ) as unknown as T[];


    }

    async delete<T>(table: string, filter: AnyObject | QueryObject): Promise<T | null> {
        const data = await this.queryOne<T>(table, filter);

        if (data === null) {
            return null;
        }

        const query = `DELETE FROM ${table} WHERE ${Object.keys(filter || {}).map(value => value + " = ?")}`;

        const result = await (await this.connection as Database).run(query, Object.values(filter || {}));

        return result.changes ? data : null;

    }

    async exists<T>(table: string, id: string): Promise<boolean> {
        const result = await this.queryOne(table, {id});

        return result !== null;
    }

    async insert<U, T>(table: string, data: U[] | U, oneEntry?: boolean): Promise<T[] | T | null> {
        this.log.debug("Inserting data into table " + table);

        const dbData = (Array.isArray(data) ? data : [data])
            .map(data => Object.assign(data, {id: uuid()})) as unknown as T[];

        const values = dbData.map(Object.keys);
        const query = `INSERT INTO ${table} (${Object.keys(dbData[0]).join(", ")}) VALUES (?)`;

        const db = (await this.connection as Database);

        const result = await db.run(query, values).catch(reason => {
            return db.run(query, values).catch(reason1 => {
                this.log.error(`Could not insert data into ${table} because: ${reason1}`);
                throw reason1;
            });
        });

        this.log.info(`Inserted ${result.changes} entries in table ${table}`);

        return oneEntry ? dbData[0] : dbData;
    }

    async queryAll<T>(table: string, filter?: AnyObject | {}, query?: QueryObject): Promise<T[] | []> {
        this.log.info("Fetching some data from table " + table);

        const params = (query ? query[1] : []).concat(Object.values(filter || {}))

        return await (await this.connection as Database).all(this.prepareQuery(table, filter, query), ...params);
    }

    async queryOne<T>(table: string, filter?: AnyObject | {}, query?: QueryObject): Promise<T | null> {
        this.log.info("Fetching some data from table " + table);

        const params = (query ? query[1] : []).concat(Object.values(filter || {}))

        const result = await (await this.connection as Database).get(this.prepareQuery(table, filter, query), ...params);

        return (await result) || null;
    }

    async reduce<T>(table: string, field: string, data: MultiFieldData[]): Promise<T[]> {

        const dbData = await this.queryAll<SimpleObject>(table, data.map(value => ({id: value.id})));

        return await Promise.all(
            data.map(async (fieldItem) => {

                const dbFieldData = dbData.filter((value) => value.id === fieldItem.id)[0] as DbData;
                const newItems = dbFieldData[field].filter((value) => !fieldItem.value.includes(value));

                if (newItems.length === dbFieldData[field].length) {
                    return dbData;
                }

                return await this.update<UnknownObject, SimpleObject>(table, {id: field}, {[fieldItem.id]: newItems});
            })
        ) as unknown as T[];
    }

    toDbIDs<T>(ids: string[]): T[] {
        return ids as unknown as T[];
    }

    async update<U, T>(table: string, filter: AnyObject, data: U): Promise<T | null> {
        this.log.info(`Updating data in table ${table}`);

        const setParams = Object.keys(data).map(value => value + " = ?");
        const condition = Object.entries(data).map(value => value[0] + " = ?");

        const query = `UPDATE ${table} SET ${setParams} WHERE ${condition}`;

        const result = await (await this.connection as Database).run(query, ...Object.values(data), ...Object.values(filter)).catch(reason => {
            this.log.error(`Could not update data in table ${table} because: ${reason}`);
            throw reason;
        });

        this.log.info(`Updated ${result.changes} entries in table ${table}`);

        return this.queryOne(table, (data as any).id ? {_id: (data as any).id} : filter);
    }


    private prepareQuery(table: string, filter?: AnyObject | {} | AnyObject[], query?: QueryObject) {
        let condition = "";

        if (Array.isArray(filter)) {
            condition = (filter as AnyObject[]).map(value => Object.keys(value || {}).map(value => value + " = ?")).join(" OR ");
        } else {
            condition = Object.keys(filter || {}).map(value => value + " = ?").join(" OR ");
        }

        return query ? query[0] : `SELECT * FROM ${table} WHERE ${condition}`;
    }
}