import { CrudField, Operation, QueryField, SelfHandledField } from "../../handlerCreation/HandlerGenerator";
import { DbColumnTypes } from "../../dal/databases/BasicDBAccess";
import Validator, { ValidationQueryConfig } from "../../utils/Validator";
import SchemaHandler from "./SchemaHandler";
import PinAccess from "../PinAccess";
import { ROLES } from "../Config";
import PinSchemaHandler from "./PinSchemaHandler";
import BasicHandler from "../../handler/_BasicHandler";

export interface Pin {
    id: number;
    name: string;
    active: boolean;
    gpioPin: number;
    /* When the pin gets initiated this represents the default state(on/off) */
    activeByDefault: boolean;
}

export default class PinHandler extends BasicHandler {
    public table = "pin";
    public columns = {
        id: DbColumnTypes.AUTO_ID,
        name: DbColumnTypes.STRING,
        active: DbColumnTypes.BOOLEAN,
        gpioPin: DbColumnTypes.NUMBER,
        activeByDefault: DbColumnTypes.BOOLEAN
    };

    private crudRules = {
        id: { dbExists: this.table },
        name: { optional: true, isString: true },
        activeByDefault: { optional: true, isBoolean: true }
    } as ValidationQueryConfig;

    private queryRules = {
        id: { optional: true, dbExists: this.table },
        schema: { optional: true, dbExists: new SchemaHandler().table }
    } as ValidationQueryConfig;

    private activationRules = {
        id: { ignore: true },
        schemaId: { ignore: true },
        mode: { inList: [0, 1, 2] },
        pinId: { dbExists: this.table }
    } as ValidationQueryConfig;

    private static buildFilter(args: any) {
        let filter = {};

        if (args.id) {
            filter = { id: args.id, ...filter };
        }

        if (args.schema) {
            filter = { schema: args.schema, ...filter };
        }

        return filter;
    }

    public getQueryConfig(): (QueryField | SelfHandledField)[] {
        return [
            {
                role: ROLES.USER,
                location: { name: "pins" },
                preCheck: (source, args) => Validator.validateOne(args, this.queryRules),
                filter: (source, args) => PinHandler.buildFilter(args)
            },
            {
                role: ROLES.USER,
                options: { oneEntry: true },
                location: { root: "PinMode", name: "pin" },
                filter: (source) => ({ id: source.pinId }),
                preCheck: (source, args) => Validator.validateOne(args, this.queryRules)
            }
        ];
    }

    public getCrudConfig(): (CrudField | SelfHandledField)[] {
        return [
            {
                role: ROLES.USER,
                location: { name: "editPin" },
                operation: Operation.UPDATE,
                options: { oneEntry: true },
                preCheck: async (source, args) => {
                    if (Object.keys(args).length < 2) {
                        return new Error("Property 'name' or 'activeByDefault' must be set.");
                    }

                    return Validator.validateOne(args, this.crudRules);
                },
                filter: (source, args) => ({ id: args.id }),
                preProcessing: async (source, args, context, db) => {
                    const pin = await db.queryOne<Pin>(PinHandler.buildFilter(args));

                    if (args.name) {
                        pin.name = args.name;
                    }

                    if (typeof args.activeByDefault === "boolean") {
                        pin.activeByDefault = args.activeByDefault;
                    }

                    return pin;
                }
            },
            {
                role: ROLES.USER,
                options: { internal: true },
                operation: Operation.UPDATE,
                location: { name: "activatePins" },
                preCheck: (source, args) => Validator.validateMany(args, this.activationRules),
                preProcessing: (source, args) => PinSchemaHandler.getToChangePins(args),
                postProcessing: async (data: Pin[], source, args) => {
                    if (args.active || (await new SchemaHandler().getDB().queryOne({ active: true }))) {
                        PinSchemaHandler.getToChangePins(args).forEach((pin) => {
                            PinAccess.getInstance().setState(pin.id, pin.active);
                        });
                    } else {
                        this.log.info("No active schema. Setting default states.");
                        data.forEach((pin) => {
                            PinAccess.getInstance().setState(pin.id, pin.activeByDefault);
                        });
                    }
                }
            },
            {
                role: ROLES.USER,
                location: { name: "pinTest" },
                preCheck: async (source, args) => args.nr > 0 && args.nr < 9,
                handler: async (source, args): Promise<string> => {
                    const { nr } = args;

                    PinAccess.getInstance().setState(nr, args.up);

                    return `Pin ${nr} is ${Number(args.up)}`;
                }
            }
        ];
    }
}
