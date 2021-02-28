import {
    ContextType,
    CrudField,
    Operation,
    QueryField,
    RoutineField,
    SelfHandledField
} from "../_macris/handlerCreation/HandlerGenerator";
import { DbColumnTypes } from "../_macris/dal/databases/BasicDBAccess";
import Validator, { ValidationQueryConfig } from "../_macris/utils/validator/Validator";
import { MULTI_SCHEMA_PRIORITY, ONE_SCHEMA_MODE } from "../CustomConfig";
import BasicHandler from "../_macris/handler/_BasicHandler";
import { ROLES } from "../_macris/config/Config";

export type DbSetting = { key: string; value: any };

export interface Settings {
    oneSchemaMode: boolean;
    multiSchemaPriority: "lowest" | "highest";
}

export default class SettingsHandler extends BasicHandler {
    public table = "settings";
    public columns = {
        key: DbColumnTypes.STRING,
        value: DbColumnTypes.STRING
    };

    private rules = {
        oneSchemaMode: { optional: true, isBoolean: true },
        multiSchemaPriority: { optional: true, string: { inList: ["highest", "lowest"] } }
    } as ValidationQueryConfig;

    /* eslint-disable class-methods-use-this */
    public static async postProcessing(data: DbSetting[]): Promise<Settings> {
        return Object.fromEntries(
            ((data as any[]) || []).map((setting) => {
                let { value } = setting;

                if (setting.key === "oneSchemaMode") {
                    value = value === "true";
                }

                return [setting.key, value];
            })
        ) as Settings;
    }

    public static preProcessing(settings: Settings): DbSetting[] {
        return Object.entries(settings).map((setting) => ({
            key: setting[0],
            value: setting[1]
        }));
    }

    private static setEmitter(context: ContextType, settings: Settings) {
        context.setEmitter("getSettings", () => settings);
    }

    public getQueryConfig(): (QueryField | SelfHandledField)[] {
        return [
            {
                role: ROLES.USER,
                location: { name: "settings" },
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
                preCheck: (source, args) => Validator.validate(args.settings, this.rules),
                handler: async (source, args, context, db) => {
                    SettingsHandler.setEmitter(context, args.settings);

                    await SettingsHandler.preProcessing(args.settings).map(async (value) => {
                        if (await db.queryOne({ key: value.key })) {
                            await db.update({ key: value.key }, value);
                        } else {
                            await db.insert(value);
                        }
                    });

                    return args.settings;
                }
            }
        ];
    }

    public getRoutines(): RoutineField[] {
        return [
            {
                name: "Setting init",
                runAtStartup: true,
                handler: async (context, db) => {
                    let settings: Settings;

                    const result = await db.query<DbSetting>();

                    if (!result || result.length === 0) {
                        settings = {
                            oneSchemaMode: ONE_SCHEMA_MODE,
                            multiSchemaPriority: MULTI_SCHEMA_PRIORITY
                        };

                        db.insert(SettingsHandler.preProcessing(settings));
                    } else {
                        settings = await SettingsHandler.postProcessing(result);
                    }

                    context.setEmitter("getSettings", () => settings);

                    this.log.info("Initialized all settings.");
                }
            }
        ];
    }
}
