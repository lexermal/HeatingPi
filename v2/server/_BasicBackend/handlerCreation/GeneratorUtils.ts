import {GenericCrudConfig, GenericHandlerResult, GenericQueryConfig, GenericQueryFields, Options, UnknownObject} from "./HandlerGenerator";
import Log from "../utils/Logger";
import DB_Abstractor from "../dal/DB_Abstractor";

export default class GeneratorUtils {

    public static getMethodHandler<T>(
        config: GenericQueryConfig | GenericCrudConfig,
        customOperation: (field: T, configItem: string, source: UnknownObject, args: any) => Promise<UnknownObject | null | []>): GenericHandlerResult {
        const handlerObject = {} as GenericHandlerResult;

        Object.keys(config).forEach((configItem) => {
            const field = config[configItem] as unknown as T;

            handlerObject[configItem] = async (source, args): Promise<UnknownObject | null | []> => await customOperation(field, configItem, source, args);
        });

        return handlerObject;
    }


    /**
     * Creates the filter for the query.
     * @param field
     * @param source
     * @param args
     * @private
     */
    public static getFilter(field: GenericQueryFields, source: UnknownObject, args: UnknownObject) {
        if (!(field.options?.noFilterOnNoID && !args.id)) {
            const filterListResult = field.filter(source, args);
            const filterValues = Object.values(filterListResult)[0];

            if (Array.isArray(filterValues)) {
                const firstKey = Object.keys(filterListResult)[0];

                return {
                    [firstKey === "id" ? "_id" : firstKey]: {$in: (new DB_Abstractor("")).toDbIDs(filterValues)},
                };
            }
            return filterListResult;
        }
        return {};
    }

    /**
     * Get all required args by returning all args without the id.
     * @param options
     * @param args
     * @private
     */
    public static getRequiredArgs(options: Options | undefined, args: any) {
        const requiredArgs = options?.requiredArgsFields || [];

        if (requiredArgs.length > 0 && options?.noFilterOnNoID && !args.id) {
            const index = requiredArgs.indexOf("id");

            if (index > -1) {
                requiredArgs.splice(index, 1);
            }
        }

        return requiredArgs;
    }

    /**
     * Checks the requirements when data is received from the api.
     * @param log
     * @param type
     * @param data
     * @param requiredFields
     * @private
     */
    public static checkRequirements(log: Log, type: string, data: UnknownObject, requiredFields?: string[]): boolean {
        if (!requiredFields) {
            return true;
        }

        const result = requiredFields.filter((value) => !Object.keys(data).includes(value));

        if (result.length > 0) {
            log.info(
                `Some of the required fields in '${type}' are not present: ${result.join(", ")}, returning no result`
            );
            return false;
        }

        return true;
    }

    public static checkFieldPresent(field: string | undefined): never | void {
        if (!field) {
            throw new Error("The field property is not set");
        }
    }


}