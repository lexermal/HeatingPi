import Log from "../utils/Logger";
import DB_Abstractor from "../dal/DB_Abstractor";
import GeneratorUtils from "./GeneratorUtils";
import {AnyObject} from "../dal/databases/MongoAccess";

export enum Operation {
    INSERT = "INSERT",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    APPEND = "APPEND",
    REDUCE = "REDUCE",
    /** Skips the database operation. */
    SKIP_DB = "SKIP_DB"
}

export interface Options {
    oneEntry?: boolean;
    noFilterOnNoID?: boolean;
    requiredSrcFields?: string[];
    requiredArgsFields?: string[];
}

export interface GenericQueryFields {
    options?: Options;
    filter: (source: any, args: any) => Record<string, unknown | string | string[]>;
    // /** If set, filter will be ignored. First parameter is the query, the second the filled in data **/
    query?: [string, string[]]
}

export interface GenericCrudFields {
    field?: string;
    options?: Options;
    operation: Operation;
    // /** If set, filter will be ignored. First parameter is the query, the second the filled in data **/
    query?: [string, string[]]
    filter?: (source: any, args: any) => AnyObject;
    preProcessing?: (source: any, args: any) => UnknownObject;
    preCheck?: (source: any, args: any) => Promise<boolean | Error>;
    dataFetching?: (source: any, args: any) => Promise<UnknownObject | UnknownObject[] | Error>;
}

export interface GenericQueryConfig {
    [key: string]: GenericQueryFields;
}

export interface GenericCrudConfig {
    [key: string]: GenericCrudFields;
}

export type GenericHandlerMethod = (source: UnknownObject, args: any) => Promise<UnknownObject | null | []>;

export interface GenericHandlerResult {
    [key: string]: GenericHandlerMethod;
}

/**
 * Generates all the methods that gets startet when the api is called
 */
export default class HandlerGenerator {
    private db: DB_Abstractor;
    private readonly log: Log;

    constructor(table: string, logger?: Log) {
        this.db = new DB_Abstractor(table);
        this.log = logger || Log.getInstance();
    }

    /**
     * Generate the query methods that get executed when api gets called
     * @param config
     */
    public generateQueryMethods(config: GenericQueryConfig): GenericHandlerResult {

        return GeneratorUtils.getMethodHandler<GenericQueryFields>(config, async (field, configItem, source, args) => {
            const argsCheck = GeneratorUtils.checkRequirements(this.log, "Arguments", args, GeneratorUtils.getRequiredArgs(field.options, args));
            const sourceCheck = GeneratorUtils.checkRequirements(this.log, "Source", source, field.options?.requiredSrcFields);

            if (!(sourceCheck && argsCheck)) {
                if (field.options?.oneEntry) {
                    return null;
                }
                return [];
            }

            const filter = GeneratorUtils.getFilter(field, source, args);
            Log.getInstance().warn(configItem, filter);

            return (await this.db.query(filter, field.query, field.options?.oneEntry)) as UnknownObject;
        })
    }

    /**
     * Generate the query methods that get executed when api gets called
     * @param data
     */
    public generateCrudMethods(data: GenericCrudConfig): GenericHandlerResult {
        return GeneratorUtils.getMethodHandler<GenericCrudFields>(data, async (field: GenericCrudFields, configItem, source, args) => {
            const argsCheck = GeneratorUtils.checkRequirements(this.log, "Arguments", args, field.options?.requiredArgsFields);
            const sourceCheck = GeneratorUtils.checkRequirements(this.log, "Source", source, field.options?.requiredSrcFields);

            if (!(sourceCheck && argsCheck)) {
                return null;
            }

            const checkResult = field.preCheck ? await field.preCheck(source, args) : true;

            if (checkResult instanceof Error) {
                this.log.error(`Failed at pre check of ${configItem}. ${checkResult.message}`);
                throw new Error(`Failed at pre check. ${checkResult.message}`);
            } else if (!checkResult) {
                this.log.error(
                    `Failed at pre check of ${configItem}. The checked result was not valid: ${checkResult.toString()}`
                );
                throw new Error(`Failed at pre check. The checked result was not valid: ${checkResult.toString()}`);
            }

            let data = args;

            if (field.dataFetching) {
                data = Object.assign(data, {dataFetchingResult: await field.dataFetching(source, args)});
            }

            if (field.preProcessing) {
                data = await field.preProcessing(source, data);
            } else if (!field.options?.oneEntry && !Array.isArray(data) && data.data) {
                data = data.data;
            }

            return await this.getDbResult(field, data, source, args);
        })
    }

    /**
     * Return the database result for crud methods
     * @param field
     * @param data
     * @param source
     * @param args
     * @private
     */
    private async getDbResult(field: GenericCrudFields, data: any, source: UnknownObject, args: any) {
        switch (field.operation) {
            case Operation.INSERT:
                return await this.db.insert(data, field.options?.oneEntry);
            case Operation.UPDATE:
                return (await this.db.update(
                    field.query || (field.filter ? field.filter(source, args) : {}),
                    data
                )) as UnknownObject;
            case Operation.DELETE:
                return await this.db.delete(field.query || (field.filter ? field.filter(source, args) : {}));
            case Operation.APPEND: {
                GeneratorUtils.checkFieldPresent(field.field);
                return (await this.db.append(field.field || "", data))[0];
                //todo check if calling if the first element is right
            }
            case Operation.REDUCE: {
                GeneratorUtils.checkFieldPresent(field.field);
                return (await this.db.reduce(field.field || "", data))[0];
                //todo check if calling if the first element is right
            }
            case Operation.SKIP_DB:
                return data;
        }
        return null;
    }

    public static generateMethods(
        table: string,
        crud: GenericCrudConfig,
        query: GenericQueryConfig
    ): GenericHandlerResult {
        const generator = new HandlerGenerator(table);

        return {
            ...generator.generateCrudMethods(crud),
            ...generator.generateQueryMethods(query),
        };
    }

}

export type UnknownObject = Record<string, unknown>;
