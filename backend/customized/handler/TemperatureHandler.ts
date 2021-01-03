import { QueryField, SelfHandledField } from "../../handlerCreation/HandlerGenerator";
import { DbColumnTypes } from "../../dal/databases/BasicDBAccess";
import readTemperature from "../TempSensorAccess";
import BasicHandler from "../../handler/_BasicHandler";
import PinAccess from "../PinAccess";

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

    public getQueryConfig(): (QueryField | SelfHandledField)[] {
        const simulated = !PinAccess.isRaspi();
        return [
            {
                location: { root: "query", name: "temperature" },
                handler: async (source, args, context, db) => {
                    const temperature = readTemperature(simulated).toFixed(2);

                    this.log.info(`The current temperature is ${temperature}°C. ${simulated && "It is simulated."}`);

                    db.insert({ value: temperature, simulated });
                    return temperature;
                }
            }
        ];
    }

    /* eslint-disable class-methods-use-this */
    public getCrudConfig(): SelfHandledField[] {
        return [];
    }
}
