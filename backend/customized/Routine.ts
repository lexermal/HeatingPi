import { USERS } from "./Config";
import Log from "../utils/Logger";
import PinAccess from "./PinAccess";
import Emitter from "../utils/Emitter";
import DbTable from "../dal/DbAbstractor";
import SettingsHandler from "./handler/SettingHandler";
import PinHandler, { Pin } from "./handler/PinHandler";
import UserHandler, { User } from "../handler/UserHandler";
import { UnknownObject } from "../handlerCreation/HandlerGenerator";
import { MULTI_SCHEMA_PRIORITY, ONE_SCHEMA_MODE } from "./CustomConfig";

export default class Routine {
    public static async init() {
        const log = Log.getInstance();
        log.info("Running initializing functions.");

        await Routine.initUser(log);
        await Routine.initPins(log);
        await Routine.initSettings(log);
    }

    private static async initUser(log) {
        const handler = new UserHandler();
        const db = new DbTable(handler.table, handler.columns);

        const newUsers = await Routine.utilGetNewItems<User>(db, USERS, "email");

        newUsers.forEach((user) => {
            log.debug(`Adding user '${user.name}'.`);
            db.insert((user as unknown) as UnknownObject);
        });
    }

    private static async initPins(log: Log) {
        const handler = new PinHandler();
        const pins = PinAccess.getPins();
        const db = new DbTable(handler.table, handler.columns);
        const newIds = await Routine.utilGetNewItems<Pin>(db, pins, "id");

        newIds.forEach((pin) => {
            log.debug(`Adding pin '${pin.name}'.`);
            db.insert((pin as unknown) as UnknownObject);
        });
    }

    private static async initSettings(log: Log) {
        const handler = new SettingsHandler();
        const db = handler.getDB();

        const result = await db.query();
        let settings = await SettingsHandler.postProcessing(result);

        if (!result) {
            settings = {
                oneSchemaMode: ONE_SCHEMA_MODE,
                multiSchemaPriority: MULTI_SCHEMA_PRIORITY
            } as Record<string, any>;

            db.insert(SettingsHandler.preProcessing(settings));
        }

        Emitter.setEmitter("getSettings", () => settings);

        log.info("Initialized all settings.");
    }

    /**
     *
     * @param db
     * @param masterData contains all the items, the old and new.
     * @param comparisonField DB field stat gets compared.
     * @private
     */
    private static async utilGetNewItems<T>(db: DbTable, masterData: any[], comparisonField: string): Promise<T[]> {
        const filter = { [comparisonField]: masterData.map((value) => value[comparisonField]) };

        const oldData = (await db.query(filter)).map((oldItem) => oldItem[comparisonField]);

        return masterData.filter((value) => !oldData.includes(value[comparisonField].toString()));
    }
}
