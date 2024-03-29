import PinAccess from "../bridge/PinAccess";
import readTemperature from "../bridge/TempSensorAccess";
import BasicHandler from "../_macris/handler/_BasicHandler";
import { DbColumnTypes } from "../_macris/dal/databases/BasicDBAccess";
import { QueryField, RoutineField, SelfHandledField } from "../_macris/handlerCreation/HandlerGenerator";
import { ROLES } from "../_macris/config/Config";

export interface Temperature {
    min: number;
    max: number;
}

export default class TemperatureHandler extends BasicHandler {
    public table = "temperature";
    public columns = {
        value: DbColumnTypes.NUMBER,
        simulated: DbColumnTypes.BOOLEAN,
        date: DbColumnTypes.AUTO_TIMESTAMP
    };

    private temperature = 0;

    /* eslint-disable class-methods-use-this */
    public getQueryConfig(): (QueryField | SelfHandledField)[] {
        return [
            {
                location: { root: "query", name: "temperature" },
                handler: async (source, args, context, db) => {
                    const result = await db.queryOne(undefined, { desc: ["date"] });

                    return result ? (result.value as number).toFixed(2) : null;
                }
            },
            {
                role: ROLES.USER,
                location: { root: "query", name: "temperatureLog" }
            }
        ];
    }

    /* eslint-disable class-methods-use-this */
    public getCrudConfig(): SelfHandledField[] {
        return [];
    }

    getRoutines(): RoutineField[] {
        const simulated = !PinAccess.isRaspi();

        return [
            {
                name: "Temperature recording",
                runAtStartup: true,
                // every 10 seconds
                // runAtCron: "*/10 * * * * *",
                // runAtCron: "*/1 * * * * *",
                runAtCron: "1 * * * * *",
                handler: async (context, db) => {
                    const sensorTemp = readTemperature(simulated);

                    const temperature = Number.isNaN(sensorTemp) ? 1000 : sensorTemp.toFixed(2);

                    this.log.info(`The current temperature is ${temperature}°C. ${simulated ? "It is simulated." : ""}`);

                    db.insert({ value: temperature, simulated });
                    if (temperature !== this.temperature) {
                        this.temperature = temperature;
                        context.emit("FETCH_TEMPERATURE", temperature);
                    }
                }
            },
            {
                name: "Temperature log cleaner",
                runAtStartup: true,
                runAtCron: "* 0 0 * * *",
                handler: async (context, db) => {
                    const lastMonth = new Date();
                    lastMonth.setMonth(lastMonth.getMonth() - 1);

                    db.delete((knex) => knex?.where("date", "<", lastMonth.getTime()));
                }
            }
        ];
    }
}
