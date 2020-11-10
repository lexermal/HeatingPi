import {DB_TABLES} from "../../Config";
import DB_Abstractor from "../dal/DB_Abstractor";

export type ValidationQueryConfig = {
    [key: string]: GenericValidationMethods;
};

export interface ValidationInputData {
    [key: string]: string | number | undefined;
}

/**
 * @lengthGT greater then
 * @lengthLT less then
 * @dbExists checks if element exists in given table
 * @optional skips checks if value not present
 * @inList   check if value is in given list
 * @isRegex  checks if value is a valid regex
 */
interface GenericValidationMethods {
    isRegex?: boolean;
    dbExists?: DB_TABLES;
    lengthGT?: number;
    lengthLT?: number;
    optional?: boolean;
    inList?: (string | number)[];
}

export default class Validator {
    /**
     * Validates a list of data objects.
     * @param data is the data received over the api
     * @param properties are the properties that are used for validation.
     * @return TRUE or the first error that occurred.
     */
    public static async validateMany(
        data: ValidationInputData[],
        properties: ValidationQueryConfig
    ): Promise<boolean | Error> {
        let finalResult = true as boolean | Error;

        await Promise.all(
            data.map(async (tagInput) => {
                if (!(finalResult instanceof Error)) {
                    finalResult = await this.validateOne(tagInput, properties);
                }
            })
        );

        return finalResult;
    }

    /**
     * Validates one data object.
     * @param data
     * @param properties
     */
    public static async validateOne(
        data: ValidationInputData,
        properties: ValidationQueryConfig
    ): Promise<boolean | Error> {
        if (!properties) {
            throw new Error("The validation config is null or undefined.");
        }

        const propertyNames = await Object.keys(properties);

        const validationResults = await Promise.all<string | boolean>(
            propertyNames.map(async (propertyName) => {
                const validationMethod = properties[propertyName];

                // skip if it's not set
                if (
                    Object.keys(validationMethod).some((value) => value === "optional") &&
                    validationMethod &&
                    !data[propertyName]
                ) {
                    return true;
                }

                return await this.validateOneProperty(
                    propertyName,
                    data[propertyName],
                    validationMethod as ValidationInputData
                );
            })
        );

        const errors = await validationResults.filter((result) => typeof result !== "boolean" || !result);

        return errors.length === 0 ? true : new Error(errors[0].toString());
    }

    /**
     * Validates one item of the input data.
     * @param propertyName
     * @param data
     * @param property
     * @private
     */
    private static async validateOneProperty(
        propertyName: string,
        data: string | number | undefined,
        property: ValidationInputData
    ): Promise<boolean | string> {

        const validationMethodResults = await Promise.all(
            Object.keys(property).map((method) => {
                return this.validateDataItemWithOneMethod(propertyName, method, data, property[method] as number | string | boolean);
            })
        );

        const errors = await validationMethodResults.filter((value) => typeof value !== "boolean" || !value);

        return errors.length > 0 ? errors[0] : true;
    }

    /**
     * Validates one data item with one method
     * @param propertyName
     * @param method
     * @param data
     * @param propertyValue
     * @private
     */
    private static async validateDataItemWithOneMethod(
        propertyName: string,
        method: string,
        data: string | number | undefined,
        propertyValue: number | string | boolean | string[]
    ): Promise<boolean | string> {
        if (!data) {
            return `No data present for ${propertyName}.`;
        }

        switch (method) {
            case "lengthGT":
                return data.toString().length > propertyValue || `The ${propertyName} is too short.`;
            case "lengthLT":
                return data.toString().length < propertyValue || `The ${propertyName} is too long.`;
            case "inList":
                return (
                    this.inList(data, propertyValue as string[]) ||
                    `The ${propertyName} contains elements that are not in the list.`
                );
            case "dbExists":
                return (
                    (await new DB_Abstractor(propertyValue as string).exists(data as string)) ||
                    `The element behind ${propertyName} does not exist.`
                );
            case "isRegex":
                try {
                    new RegExp(data as string);
                } catch (e) {
                    return "The regex is not valid";
                }
                return true
            default:
                return `The method ${method} does not exist.`;
        }
    }

    /**
     * Checks if value is in list.
     * @param data can be value or array of values
     * @param list
     * @private
     */
    private static inList(data: string | number | (string | number[]), list: (string | number)[]): boolean {
        const dataArray = Array.isArray(data) ? data : [data];

        return dataArray.every((value) => list.includes(value));
    }
}
