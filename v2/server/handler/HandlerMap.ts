import {UnknownObject} from "../_BasicBackend/handlerCreation/HandlerGenerator";
import CategoryHandler from "./category/CategoryHandler";
import {CategoryFunctions} from "./category/CategoryHandlerConfig";

const category = new CategoryHandler().getMethodPool();

export function getFieldMapping(): HandlerMap {
    return {
        Query: {
            categories: category[CategoryFunctions.GET_CATEGORIES],
        },
        Category: {
            headCategory: category[CategoryFunctions.GET_HEAD_CATEGORY],
            subCategories: category[CategoryFunctions.GET_SUB_CATEGORIES],
        },
        Entry: {
            category: category[CategoryFunctions.GET_CATEGORY_BY_ENTRY],
        },
        Field: {
            category: category[CategoryFunctions.GET_CATEGORY_BY_FIELD],
        },
        Mutation: {
            addCategory: category[CategoryFunctions.ADD_CATEGORY],
            updateCategory: category[CategoryFunctions.UPDATE_CATEGORY],
            deleteCategory: category[CategoryFunctions.DELETE_CATEGORY],
            addFieldCategory: category[CategoryFunctions.ADD_FIELD_CATEGORY],
            removeFieldCategory: category[CategoryFunctions.REMOVE_FIELD_CATEGORY],
        },
    };
}

export function getHandlerMethod(
    handler: Handlers,
    functionEnum: string
): (source: UnknownObject, args: any) => Promise<UnknownObject | null | []> {
    switch (handler) {
        case Handlers.CATEGORY:
            return category[functionEnum];
        // case Handlers.ENTRY:
        //     return entry[functionEnum];
        default:
            return () => new Promise(() => null);
    }
}

export enum Handlers {
    CATEGORY,
    TAG,
    ENTRY,
    FIELD,
    FILE,
    REGEX,
    SOURCE,
}

interface Enum {
    [id: number]: string;
}

export interface HandlerMap {
    [key: string]: {
        [key: string]: object;
    };
}
