import {GenericInputData} from "../_BasicHandler";
import {CategoryInput} from "../Interfaces";
import {GenericCrudFields, GenericQueryFields} from "../../../_BasicBackend/handlerCreation/HandlerGenerator";

export type CategoryInputData = GenericInputData<CategoryInput>;

enum QueryFunctions {
    GET_CATEGORIES = "GET_CATEGORIES",
    GET_HEAD_CATEGORY = "GET_HEAD_CATEGORY",
    GET_SUB_CATEGORIES = "GET_SUB_CATEGORIES",
    GET_CATEGORY_BY_ENTRY = "GET_CATEGORY_BY_ENTRY",
    GET_CATEGORY_BY_FIELD = "GET_CATEGORY_BY_FIELD",
}

enum CrudFunctions {
    ADD_CATEGORY = "ADD_CATEGORY",
    UPDATE_CATEGORY = "UPDATE_CATEGORY",
    DELETE_CATEGORY = "DELETE_CATEGORY",
    ADD_FIELD_CATEGORY = "ADD_FIELD_CATEGORY",
    REMOVE_FIELD_CATEGORY = "REMOVE_FIELD_CATEGORY",
}

export const CategoryFunctions = {...QueryFunctions, ...CrudFunctions};

export type CategoryQueryConfig = {
    [key in keyof typeof QueryFunctions]: GenericQueryFields;
};

export type CategoryCrudConfig = {
    [key in keyof typeof CrudFunctions]: GenericCrudFields;
};
