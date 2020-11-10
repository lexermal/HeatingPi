import * as fs from "fs";
import "graphql-import-node";
import Log from "./utils/Logger";
import {GraphQLSchema} from "graphql";
import {GRAPHQL_SCHEMA_FILE} from "../Config";
import {getFieldMapping} from "../customized/api/HandlerMap";
import {IResolvers, makeExecutableSchema} from "graphql-tools";

/**
 * Handles the creation of the handlers
 */
export default class ResolverMap {
    private log: Log;
    private resolvers: IResolvers;
    private static instance: ResolverMap | undefined;

    private constructor(handlerData?: ResolverHandler) {
        this.log = handlerData?.logger || Log.getInstance();
        this.accessFunction = this.accessFunction.bind(this);
        this.createHandler = this.createHandler.bind(this);
        this.resolvers = this.getResolvers(handlerData?.resolverMap || getFieldMapping());
    }

    public static getInstance(handlerData?: ResolverHandler): ResolverMap {
        return this.instance || (this.instance = new this(handlerData));
    }

    /**
     * Create the graphql schema
     */
    public static getSchema(): GraphQLSchema {
        return makeExecutableSchema({
            typeDefs: fs.readFileSync(__dirname + "/../" + GRAPHQL_SCHEMA_FILE).toString(),
            resolvers: this.getInstance().resolvers,
        });
    }

    private getResolvers(data: UnknownObject): IResolvers {
        return (this.getRecursivelyMappedHandlers(data, this.accessFunction) as unknown) as IResolvers;
    }

    private getRecursivelyMappedHandlers(
        data: UnknownObject,
        accessFnc: (handler: HandlerType, prop: string, root?: string) => object,
        top?: string
    ): object {
        return Object.fromEntries(
            Array.from(Object.entries(data)).map((handler: [string, object | (() => object)]) => this.createHandler(handler, accessFnc, top))
        );
    }

    private createHandler(handler: [string, object | (() => object)], accessFnc: (handler: HandlerType, prop: string, root?: string) => object, top?: string) {
        if (typeof handler[1] === "function") {
            return [handler[0], accessFnc(handler[1] as () => object, handler[0], top)];
        }

        if (!handler[1] || typeof handler[1] !== "object") {
            throw new Error(
                `The inserted value for key ${handler[0]} is no object, ${typeof handler[1]} given.`
            );
        }

        return [
            handler[0],
            this.getRecursivelyMappedHandlers(handler[1] as UnknownObject, accessFnc, handler[0]),
        ];
    }

    private accessFunction(handlerFnc: HandlerType, prop: string, root?: string) {
        return async (source: DataSource, args: DataSource): Promise<object> => {
            this.log.info(`Accessing ${prop}(${args.id || ""}) from ${root}(${source?.id || ""})`);
            return handlerFnc(source, args);
        };
    }

    public destroy(): void {
        ResolverMap.instance = undefined;
    }
}

interface UnknownObject {
    [key: string]: object;
}

export interface DataSource {
    id?: string;
    data: object;
}

export type HandlerType = (source: DataSource, args: DataSource) => object;

export interface ResolverHandler {
    logger: Log;
    resolverMap: UnknownObject;
}
