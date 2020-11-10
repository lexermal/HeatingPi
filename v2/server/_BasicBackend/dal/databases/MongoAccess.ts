import {MONGODB_DB, MONGODB_URL} from "../../../Config";
import {UnknownObject} from "../../handlerCreation/HandlerGenerator";
import {Db, DeleteWriteOpResultObject, MongoClient, ObjectId, UpdateWriteOpResult} from "mongodb";
import {DbAccessSchema, DbData, MultiFieldData, SimpleObject} from "./DbAccessSchema";

export enum UpdateOperation {
    SET = "SET",
    APPEND = "PUSH",
}

/**
 * Class for mongodb database access.
 */
export default class MongoAccess extends DbAccessSchema {
    private readonly connection: Promise<Db | Error>;

    constructor() {
        super();
        this.connection = this.initConnection();
    }

    /**
     * Initializes the connection to mongodb.
     * @private
     */
    async initConnection<Db>(): Promise<Db | Error> {
        if (this.connection) {
            return this.connection as Promise<Db | Error>;
        }

        return await MongoClient.connect(MONGODB_URL, {useUnifiedTopology: true})
            .then((client) => {
                this.log.info("Successfully connected to mongodb.");
                return client.db(MONGODB_DB) as unknown as Db;
            })
            .catch((reason) => {
                throw new Error("Error accrued while accessing the database. " + reason.message);
            });
    }

    /**
     * Returns the Mongodb connection
     */
    public getConnection<T>(): Promise<T | Error> {
        return this.initConnection();
    }

    /**
     * Queries all available data based on a filter.
     * @param table
     * @param filter
     */
    public async queryAll<T>(table: string, filter?: AnyObject | {}): Promise<T[]> {
        this.log.info("Fetching some data from table " + table);

        const db = await this.getConnection<Db>();
        if (db instanceof Error) {
            throw db;
        }

        const queryResult = await db.collection(table).find(MongoAccess.swapID(filter)).toArray();

        return (MongoAccess.convertManyIds(queryResult) as unknown) as T[];
    }

    /**
     * Queries only first row of results.
     * @param table
     * @param filter
     */
    public async queryOne<T>(table: string, filter?: AnyObject | {}): Promise<T | null> {
        this.log.info("Fetching some data from table " + table);

        const db = await this.getConnection<Db>();
        if (db instanceof Error) {
            throw db;
        }

        return (await db.collection(table).findOne(MongoAccess.swapID(filter)).then(value => MongoAccess.convertOneId<T>(value)));
    }

    /**
     * Inserts data<U> into the table ans returns the result<T>.
     * @param table
     * @param data
     * @param onEntry specifies of only one entry should be returned.
     */
    public async insert<U, T>(table: string, data: U | U[], onEntry?: boolean): Promise<T[] | T | null> {
        this.log.debug(`Inserting data into table ${table}`);

        const insertData = (Array.isArray(data) ? data : [data]).map((value) =>
            MongoAccess.swapID((value as unknown) as AnyObject)
        );

        const db = await this.getConnection<Db>();
        if (db instanceof Error) {
            throw db;
        }

        const insertResult = await db.collection(table).insertMany(insertData);

        this.log.info(`Inserted ${insertResult.insertedCount} entries in table ${table}`);
        const ids = Object.values(Object.assign({}, insertResult.insertedIds));

        const filter = {_id: {$in: ids}};

        if (onEntry) {
            return await this.queryOne<T>(table, filter);
        }

        return await this.queryAll<T>(table, filter);
    }

    /**
     * Updates db entries.
     * @param table
     * @param filter
     * @param data
     * @param operation can be SET for replacement and APPEND for appendices.
     */
    public async update<U, T>(table: string, filter: AnyObject, data: U, operation = UpdateOperation.SET): Promise<T | null> {
        this.log.info(`Updating data in table ${table}`);

        const db = await this.getConnection<Db>();
        if (db instanceof Error) {
            throw db;
        }

        return await db
            .collection(table)
            .updateMany(MongoAccess.swapID(filter as AnyObject), {["$" + operation.toLowerCase()]: data})
            .then(async (data: UpdateWriteOpResult) => {
                this.log.info(`Updated ${data.modifiedCount} entries in table ${table}`);
                return await this.queryOne<T>(table, filter);
            });
    }

    /**
     * Deletes data from a table.
     * Returns null if nothing to delete.
     * @param table
     * @param filter
     */
    public async delete<T>(table: string, filter: AnyObject): Promise<T | null> {
        this.log.info("Deleting data in table " + table);

        const data = await this.queryOne<T>(table, filter);

        if (data === null) {
            return null;
        }

        const db = await this.getConnection<Db>();
        if (db instanceof Error) {
            throw db;
        }

        return await db
            .collection(table)
            .deleteMany(filter as AnyObject)
            .then((result: DeleteWriteOpResultObject) => {
                this.log.info("Deleted " + result.deletedCount + " entries in table " + table);

                return result.deletedCount !== 0 ? data : null;
            });
    }

    /**
     * Checks whether the id exists in the db table.
     * @param table
     * @param id
     */
    public async exists(table: string, id?: string): Promise<boolean> {
        return (
            id !== undefined &&
            ObjectId.isValid(id) &&
            Object.keys(
                await this.queryOne<UnknownObject>(table, {id}) || {}
            ).length > 0
        );
    }

    /**
     * Appends data to a field.
     * @param table
     * @param field
     * @param data
     */
    public async append<T>(table: string, field: string, data: MultiFieldData[]): Promise<T[]> {
        const dbData = await this.queryAll<SimpleObject>(table, {_id: {$in: this.toDbIDs(Object.keys(data))}});

        return await Promise.all(
            data.map(async (fieldItem) => {

                const dbFieldData = dbData.filter((value) => value.id === fieldItem.id)[0] as DbData;
                const newItems = fieldItem.value.filter((v) => !dbFieldData[field].includes(v));

                if (newItems.length === 0) {
                    return dbData;
                }

                return await this.update(table, {id: field}, {[fieldItem.id]: {$each: newItems}}, UpdateOperation.APPEND);
            })
        ) as unknown as T[];
    }

    public async reduce<T>(table: string, field: string, data: MultiFieldData[]): Promise<T[]> {
        const dbData = await this.queryAll<SimpleObject>(table, {_id: {$in: this.toDbIDs(Object.keys(data))}});

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


    /**
     * Swaps "id" with "_id" for internal db use.
     * @param data
     * @private
     */
    private static swapID(data?: any): AnyObject {
        if (!(data && Object.keys(data).includes("id"))) {
            return data || {};
        }

        if (typeof data.id === "string" || data.id instanceof String) {
            try {
                data["_id"] = new ObjectId(data.id as string);
            } catch (e) {
                throw new Error(`The given id "${data.id}" for filtering is not valid.`);
            }

            delete data.id;
        } else if (data.id === undefined) {
            throw new Error(
                "ID needs to be defined, programming error in one of the handlers. "
                // "If id is not set it should not make a db request"
            );
        }

        return data;
    }

    /**
     * Converts a normal id to a object that contains the id.
     * @param data
     */
    public toDbIDs<ObjectId>(data: string[]): ObjectId[] {
        return data.map((value) => new ObjectId(value)) as unknown as ObjectId[];
    }

    /**
     * Converts db ids to external ids.
     * @param data
     * @private
     */
    private static convertOneId<T>(data: T): T | null {
        if (data === null) {
            return null;
        }

        const resultObject = Object.assign(data, {id: (data as any)._id}) as any;
        delete resultObject._id;

        return resultObject;
    }

    private static convertManyIds<T>(data: T[] | null): T[] | null {
        if (data === null) {
            return null;
        }

        return data.map(MongoAccess.convertOneId) as T[];
    }

    public initTable(table: string, columns: [string, string][]): Promise<void> {
        return Promise.resolve(undefined);
    }
}

export interface AnyObject {
    [key: string]: string | number | boolean | UnknownObject | {};
}
