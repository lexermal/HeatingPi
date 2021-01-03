import {
    ContextType,
    CrudField,
    Operation,
    QueryField,
    SelfHandledField
} from "../../handlerCreation/HandlerGenerator";
import { DbColumnTypes } from "../../dal/databases/BasicDBAccess";
import Validator, { ValidationQueryConfig } from "../../utils/Validator";
import BasicHandler from "../../handler/_BasicHandler";
import { ROLES } from "../Config";

export default class SettingsHandler extends BasicHandler {
    public table = "settings";
    public columns = {
        key: DbColumnTypes.STRING,
        value: DbColumnTypes.STRING
    };

    private rules = {
        oneSchemaMode: { optional: true, isBoolean: true },
        multiSchemaPriority: { optional: true, inList: ["highest", "lowest"] }
    } as ValidationQueryConfig;

    public getQueryConfig(): (QueryField | SelfHandledField)[] {
        return [
            {
                role: ROLES.USER,
                location: { name: "settings" },
                filter: () => ({}), // allows to fetch all data
                postProcessing: SettingsHandler.postProcessing
            }
        ];
    }

    public getCrudConfig(): (CrudField | SelfHandledField)[] {
        return [
            {
                role: ROLES.USER,
                location: { name: "applySettings" },
                operation: Operation.INSERT_OR_UPDATE,
                preCheck: (source, args) => Validator.validateOne(args.settings, this.rules),
                handler: async (source, args, context, db) => {
                    SettingsHandler.setEmitter(context, args.settings);

                    await db.insert(SettingsHandler.preProcessing(args.settings));

                    return args.settings;
                }
            }
        ];
    }

    public static async postProcessing(data) {
        return Object.fromEntries(
            ((data as any[]) || []).map((setting) => {
                let { value } = setting;

                if (setting.key === "oneSchemaMode") {
                    value = Boolean(value);
                }

                return [setting.key, value];
            })
        );
    }

    public static preProcessing(settings): Record<string, any> {
        return Object.entries(settings).map((setting) => ({
            key: setting[0],
            value: setting[1]
        }));
    }

    private static setEmitter(context: ContextType, settings) {
        context.setEmitter("getSettings", () => settings);
    }
}
