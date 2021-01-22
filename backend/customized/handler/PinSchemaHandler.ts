import { CrudField, Operation, QueryField, SelfHandledField } from "../../handlerCreation/HandlerGenerator";
import { DbColumnTypes } from "../../dal/databases/BasicDBAccess";
import Validator, { ValidationQueryConfig } from "../../utils/Validator";
import BasicHandler from "../../handler/_BasicHandler";
import { Schema } from "./SchemaHandler";
import PinHandler from "./PinHandler";
import { ROLES } from "../Config";

export interface PinSchema {
    pinId: number;
    mode: number; // 0...off, 1...on, 2....unchanged
    schemaId: string;
}

export interface PinMode {
    pinId: number;
    mode: number;
}

export interface AbsolutePinMode {
    id: number;
    active: boolean;
}

export default class PinSchemaHandler extends BasicHandler {
    public table = "pinschema";
    public columns = {
        mode: DbColumnTypes.NUMBER,
        pinId: DbColumnTypes.STRING,
        schemaId: DbColumnTypes.STRING
    };

    private rules = {
        mode: { inList: [0, 1, 2] },
        pinId: { dbExists: new PinHandler().table }
    } as ValidationQueryConfig;

    public static getToChangePins(data: PinMode[]): AbsolutePinMode[] {
        return data.filter((value) => value.mode !== 2).map((value) => ({ id: value.pinId, active: value.mode === 1 }));
    }

    /* eslint-disable class-methods-use-this */
    public getQueryConfig(): (QueryField | SelfHandledField)[] {
        return [
            {
                role: ROLES.USER,
                location: { root: "schema", name: "pinModes" },
                filter: (source: Schema) => ({ schemaId: Array.isArray(source) ? source[0].id : source.id })
            }
        ];
    }

    public getCrudConfig(): (CrudField | SelfHandledField)[] {
        return [
            {
                role: ROLES.USER,
                options: { internal: true },
                operation: Operation.INSERT,
                location: { name: "addPinSchema" },
                preCheck: (source, args) => Validator.validateMany(args.mode, this.rules),
                preProcessing: (source: Schema, args) => {
                    return args.mode.map(
                        (item) =>
                            ({
                                mode: item.mode,
                                pinId: item.pinId,
                                schemaId: source.id
                            } as PinSchema)
                    );
                }
            },
            {
                role: ROLES.USER,
                options: { internal: true },
                operation: Operation.DELETE,
                location: { name: "deletePinSchema" },
                filter: (source) => ({ schemaId: source.id })
            }
        ];
    }
}
