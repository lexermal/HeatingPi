import {
    ContextType,
    CrudField,
    Operation,
    QueryField,
    RoutineField,
    SelfHandledField,
    UnknownObject
} from "../_macris/handlerCreation/HandlerGenerator";
import { DbColumnTypes } from "../_macris/dal/databases/BasicDBAccess";
import Validator, { ValidationQueryConfig } from "../_macris/utils/validator/Validator";
import PinSchemaHandler, { PinMode } from "./PinSchemaHandler";
import BasicHandler from "../_macris/handler/_BasicHandler";
import { Temperature } from "./TemperatureHandler";
import { Settings } from "./SettingHandler";
import DbTable from "../_macris/dal/DBTable";
import { ROLES } from "../_macris/config/Config";

export interface Schema {
    id: string;
    name: string;
    active: boolean;
    running: boolean;
    temperature: Temperature;
}

export interface DbSchema {
    id: string;
    name: string;
    active: boolean;
    running: boolean;
    temperatureMin: number;
    temperatureMax: number;
}

export default class SchemaHandler extends BasicHandler {
    public table = "schema";
    public columns = {
        name: DbColumnTypes.STRING,
        active: DbColumnTypes.BOOLEAN,
        running: DbColumnTypes.BOOLEAN,
        temperatureMin: DbColumnTypes.NUMBER,
        temperatureMax: DbColumnTypes.NUMBER
    };

    private queryRules = {
        id: { optional: true, string: { dbExists: this.table } },
        active: { optional: true, isBoolean: true }
    } as ValidationQueryConfig;

    private activationRules = {
        id: { string: { dbExists: this.table } },
        active: { isBoolean: true }
    } as ValidationQueryConfig;

    private static async validate(source: any, args: any, context: ContextType, db: DbTable): Promise<boolean> {
        if (args.id && !(await db.exists(args.id))) {
            throw new Error("The id is not valid.");
        }

        if (args.mode.length === 0) {
            throw new Error("No pin modes are set.");
        }

        if (args.name.length < 3) {
            throw new Error("The schema name is too short.");
        }

        const pinSchemaDB = new PinSchemaHandler().getDB();

        args.mode.forEach((value: PinMode) => {
            if (value.mode > 2 || value.mode < 0) {
                throw new Error("The pin mode is not valid");
            }

            if (!pinSchemaDB.exists(value.pinId.toString())) {
                throw new Error(`The pin ${value.pinId} does not exist.`);
            }
        });

        if (args.temperature.min >= args.temperature.max) {
            throw new Error("The min temperature needs to be lower then max temperature.");
        }

        return true;
    }

    private static preProcessing(args: any) {
        return {
            name: args.name,
            active: false,
            running: false,
            temperatureMin: args.temperature.min,
            temperatureMax: args.temperature.max
        };
    }

    private static async postProcessing(
        data: UnknownObject | UnknownObject[],
        context: ContextType,
        args: any,
        create?: boolean,
        remove?: boolean,
        activate?: boolean
    ) {
        if (remove) {
            await this.callHandler(context, "deletePinSchema", data, args);
        }

        if (create && data) {
            await this.callHandler(context, "addPinSchema", data, args);
        }

        if (activate) {
            await SchemaHandler.activateSchema(context, args);
        }

        if (Array.isArray(data)) {
            return data.map(SchemaHandler.translateData);
        }
        return SchemaHandler.translateData(data);
    }

    private static async callHandler(context: ContextType, mutationName: string, data: any, args: any) {
        await context
            .callHandlerMethod({ root: "mutation", name: mutationName }, data, args)
            .catch(SchemaHandler.catch);
    }

    private static translateData(data: UnknownObject) {
        if (!data) {
            return data;
        }

        return {
            id: data.id,
            name: data.name,
            active: data.active,
            running: data.running,
            temperature: {
                min: data.temperatureMin,
                max: data.temperatureMax
            }
        } as any;
    }

    private static catch(reason: Error) {
        throw reason;
    }

    private static async activateSchema(context: ContextType, args: any) {
        const location = { root: "schema", name: "pinModes" };
        const pinModes = await context.callHandlerMethod(location, { id: args.id }, args).catch(SchemaHandler.catch);

        await context
            .callHandlerMethod({ root: "mutation", name: "activatePins" }, args, pinModes)
            .catch(SchemaHandler.catch);
    }

    public getQueryConfig(): (QueryField | SelfHandledField)[] {
        return [
            {
                role: ROLES.USER,
                location: { name: "schema" },
                preCheck: (source, args) => Validator.validate(args, this.queryRules),
                filter: (source, args) => {
                    let filter = {};

                    if (args.id) {
                        filter = Object.assign(filter, { id: args.id });
                    }

                    if (args.active) {
                        filter = Object.assign(filter, { active: args.active });
                    }

                    return filter;
                },
                postProcessing: (data: UnknownObject, s, args, context) => {
                    return SchemaHandler.postProcessing(data, context, args);
                }
            }
        ];
    }

    public getCrudConfig(): (CrudField | SelfHandledField)[] {
        return [
            {
                location: { name: "addSchema" },
                operation: Operation.INSERT,
                options: { oneEntry: true },
                preCheck: SchemaHandler.validate,
                preProcessing: (source, args) => SchemaHandler.preProcessing(args),
                postProcessing: (data: UnknownObject, s, a, c) => SchemaHandler.postProcessing(data, c, a, true)
            },
            {
                location: { name: "editSchema" },
                operation: Operation.UPDATE,
                options: { oneEntry: true },
                preCheck: SchemaHandler.validate,
                filter: (source, args) => ({ id: args.id }),
                preProcessing: (source, args) => SchemaHandler.preProcessing(args),
                postProcessing: (data: UnknownObject, s, args, c) => {
                    return SchemaHandler.postProcessing(data, c, args, true, true);
                }
            },
            {
                location: { name: "deleteSchema" },
                operation: Operation.DELETE,
                options: { oneEntry: true },
                preCheck: { argsRules: { id: { string: { dbExists: this.table } } } },
                filter: (source, args) => ({ id: args.id }),
                postProcessing: (data: UnknownObject, s, a, c) => {
                    return SchemaHandler.postProcessing(data, c, a, false, true);
                }
            },
            {
                location: { name: "activateSchema" },
                options: { oneEntry: true },
                operation: Operation.UPDATE,

                filter: (source, args) => ({ id: args.id }),
                preCheck: (source, args) => Validator.validate(args, this.activationRules),

                preProcessing: async (source, args, context, db) => {
                    if (args.active && (await context.emit("getSettings")).oneSchemaMode) {
                        this.log.info("Disabling all other active schemas.");
                        await db.update({ active: true }, { active: false });
                    }
                    return { active: args.active };
                },
                postProcessing: (data: UnknownObject, s, args, context) => {
                    return SchemaHandler.postProcessing(data, context, args, false, false, true);
                }
            }
        ];
    }

    getRoutines(): RoutineField[] {
        return [
            {
                name: "Schema check temperature",
                runAtStartup: true,
                handler: async (context, db) => {
                    // this function only executes pin changes if multiple are in range and one is selected.
                    context.setEmitter("FETCH_TEMPERATURE", async (temp: number) => {
                        const settings = (await context.emit("getSettings")) as Settings | undefined;

                        if (!settings) {
                            return undefined;
                        }

                        const runningSchema = await this.getRunningSchema(temp, settings, db);

                        await this.getDB().update({}, { running: false });

                        if (runningSchema) {
                            await this.getDB().update({ id: runningSchema.id }, { running: true });

                            this.log.info(
                                `Schema ${runningSchema.name} is matching with the temperature and will be activated.`
                            );
                            await SchemaHandler.activateSchema(context, { id: runningSchema.id });
                        }
                        return undefined;
                    });
                }
            }
        ];
    }

    private async getRunningSchema(temp: number, settings: Settings, db: DbTable): Promise<DbSchema | undefined> {
        const activeSchemas = await db.query<DbSchema>({ active: true });

        if (!activeSchemas || activeSchemas.length === 0) {
            return undefined;
        }

        const schemasInRange = activeSchemas.filter(
            (schema: any) => temp >= schema.temperatureMin && temp <= schema.temperatureMax
        );

        if (schemasInRange.length === 0) {
            this.log.debug("No schemas found that are in range for state change.");
            return undefined;
        }

        const parameter = settings.multiSchemaPriority === "lowest" ? "temperatureMin" : "temperatureMax";

        return schemasInRange.reduce((prev, curr) => {
            return prev[parameter] < curr[parameter] ? prev : curr;
        });
    }
}
