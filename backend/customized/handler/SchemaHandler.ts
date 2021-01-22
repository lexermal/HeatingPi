import {
    ContextType,
    CrudField,
    Operation,
    QueryField,
    SelfHandledField,
    UnknownObject
} from "../../handlerCreation/HandlerGenerator";
import { DbColumnTypes } from "../../dal/databases/BasicDBAccess";
import Validator, { ValidationQueryConfig } from "../../utils/Validator";
import PinSchemaHandler, { PinMode } from "./PinSchemaHandler";
import BasicHandler from "../../handler/_BasicHandler";
import { Temperature } from "./TemperatureHandler";

export interface Schema {
    id: string;
    name: string;
    active: boolean;
    temperature: Temperature;
}

export default class SchemaHandler extends BasicHandler {
    public table = "schema";
    public columns = {
        name: DbColumnTypes.STRING,
        active: DbColumnTypes.BOOLEAN,
        temperatureMin: DbColumnTypes.NUMBER,
        temperatureMax: DbColumnTypes.NUMBER
    };

    private queryRules = {
        id: { optional: true, dbExists: this.table },
        active: { optional: true, isBoolean: true }
    } as ValidationQueryConfig;

    private activationRules = {
        id: { dbExists: this.table },
        active: { isBoolean: true }
    } as ValidationQueryConfig;

    private static async validate(source, args, context, db): Promise<boolean> {
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
            await context
                .callHandlerMethod(
                    {
                        root: "mutation",
                        name: "deletePinSchema"
                    },
                    data,
                    args
                )
                .catch(SchemaHandler.catch);
        }

        if (create) {
            await context
                .callHandlerMethod(
                    {
                        root: "mutation",
                        name: "addPinSchema"
                    },
                    data,
                    args
                )
                .catch(SchemaHandler.catch);
        }

        if (activate) {
            await SchemaHandler.activateSchema(context, args);
        }

        if (Array.isArray(data)) {
            return data.map(SchemaHandler.translateData);
        }
        return SchemaHandler.translateData(data);
    }

    private static translateData(data: UnknownObject) {
        return {
            id: data.id,
            name: data.name,
            active: data.active,
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
                location: { name: "schema" },
                preCheck: (source, args) => Validator.validateOne(args, this.queryRules),
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
                preCheck: (source, args) => Validator.validateOne(args, { id: { dbExists: this.table } }),
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
                preCheck: (source, args) => Validator.validateOne(args, this.activationRules),

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
}
