import {BasicHandler} from "../_BasicHandler";
import Validator, {ValidationInputData, ValidationQueryConfig} from "../../_BasicBackend/utils/Validator";
import {Operation, UnknownObject} from "../../_BasicBackend/handlerCreation/HandlerGenerator";
import {Entry, Field, FieldCategoryInput, FileType, Scope, Tag, TagCategoryInput, TagInput,} from "../Interfaces";
import {getHandlerMethod, Handlers} from "../HandlerMap";
import {CategoryCrudConfig, CategoryInputData, CategoryQueryConfig} from "./CategoryHandlerConfig";
import {DB_TABLES} from "../../Config";
import {AnyObject} from "../../_BasicBackend/dal/databases/MongoAccess";
import DB_Abstractor from "../../_BasicBackend/dal/DB_Abstractor";

export default class CategoryHandler extends BasicHandler {
    protected table = DB_TABLES.CATEGORY;
    private db = new DB_Abstractor(this.table);
    private categoryRules = {
        name: {lengthGT: 3},
        headCategoryId: {optional: true, dbExists: this.table},
        allowedFileTypes: {inList: Object.values(FileType)},
        entryPermission: {inList: Object.values(Scope)},
    } as ValidationQueryConfig;

    constructor() {
        super();
        this.categoryChangeCheck = this.categoryChangeCheck.bind(this);
    }

    protected getQueryConfig(): CategoryQueryConfig {
        return {
            GET_CATEGORIES: {
                options: {noFilterOnNoID: true, requiredArgsFields: ["id"]},
                filter: (source, args): UnknownObject => ({id: args.id}),
            },
            GET_HEAD_CATEGORY: {
                options: {oneEntry: true, requiredSrcFields: ["headCategoryId"]},
                filter: (source): UnknownObject => ({id: source.headCategoryId}),
            },
            GET_SUB_CATEGORIES: {
                options: {requiredSrcFields: ["id"]},
                filter: (source): UnknownObject => ({headCategoryId: source.id}),
            },
            GET_CATEGORY_BY_ENTRY: {
                options: {requiredSrcFields: ["category"], oneEntry: true},
                filter: (source: Entry): UnknownObject => ({id: source.category}),
            },
            GET_CATEGORY_BY_FIELD: {
                options: {requiredSrcFields: ["category"], oneEntry: true},
                filter: (source: Field): UnknownObject => ({id: source.category}),
            },
        };
    }

    protected getCrudConfig(): CategoryCrudConfig {
        return {
            ADD_CATEGORY: {
                operation: Operation.INSERT,
                options: {oneEntry: true},
                dataFetching: this.fetchTagIds,
                preCheck: this.categoryChangeCheck,
                preProcessing: CategoryHandler.addCategoryPreprocessing,
            },
            UPDATE_CATEGORY: {
                operation: Operation.UPDATE,
                preCheck: this.categoryChangeCheck,
                options: {requiredArgsFields: ["id"]},
                filter: (source, args): AnyObject => ({id: args.id}),
                preProcessing: CategoryHandler.addCategoryPreprocessing,
            },
            DELETE_CATEGORY: {
                operation: Operation.DELETE,
                options: {requiredArgsFields: ["id"]},
                filter: (source, args): AnyObject => ({id: args.id}),
            },
            ADD_FIELD_CATEGORY: {
                field: "fields",
                operation: Operation.APPEND,
                filter: this.categoryExpansionFilter,
                preCheck: this.checkAddFieldCategory,
                options: {requiredArgsFields: ["categoryId"]},
                preProcessing: CategoryHandler.preProcessingAddFieldCategory,
            },
            REMOVE_FIELD_CATEGORY: {
                field: "fields",
                operation: Operation.REDUCE,
                filter: this.categoryExpansionFilter,
                options: {requiredArgsFields: ["categoryId"]},
            },
        };
    }

    private categoryExpansionFilter(_source: null, args: TagCategoryInput[]): AnyObject {
        return {_id: {$in: this.db.toDbIDs(args.map((value) => value.categoryId))}};
    }

    // private preProcessingAddTagCategory(_source: null, args: TagCategoryInput[]): UnknownObject {
    //     const result = {} as { [key: string]: string[] };
    //
    //     args.forEach((value) => {
    //         result[value.categoryId] = value.tagIds;
    //     });
    //     return result;
    // }

    private static preProcessingAddFieldCategory(_source: null, args: FieldCategoryInput[]): AnyObject {
        const result = {} as { [key: string]: string[] };

        args.forEach((value) => {
            result[value.categoryId] = value.fieldIds;
        });
        return result;
    }

    // private async checkAddTagCategory(_source: null, args: TagCategoryInput[]): Promise<boolean | Error> {
    //     const ids = [] as string[];
    //     args.forEach((value) => ids.push(...value.tagIds));
    //
    //     const foundTags = await MongoAccess.queryAll<string>(this.table, {_id: {$in: MongoAccess.toObjectIDs(ids)}});
    //
    //     if (foundTags.length !== args.length) {
    //         return new Error("Some tag ids are not valid");
    //     }
    //
    //     return await this.checkCategory(
    //         args.length,
    //         args.map((value) => value.categoryId)
    //     );
    // }

    private async checkAddFieldCategory(_source: null, args: FieldCategoryInput[]): Promise<boolean | Error> {
        const ids = [] as string[];
        args.forEach((value) => ids.push(...value.fieldIds));

        const foundFields = await this.db.query({_id: {$in: this.db.toDbIDs(ids)}});

        if (foundFields!.length !== args.length) {
            return new Error("Some fields ids are not valid");
        }

        return await this.checkCategory(
            args.length,
            args.map((value) => value.categoryId)
        );
    }

    private async checkCategory(argsSize: number, ids: string[]): Promise<boolean | Error> {
        const foundCategories = await this.db.query({_id: {$in: this.db.toDbIDs(ids)}});

        if (foundCategories!.length !== argsSize) {
            return new Error("Some category ids are not valid");
        }
        return true;
    }

    private async categoryChangeCheck(_source: null, args: CategoryInputData): Promise<boolean | Error> {
        return await Validator.validateOne((args.data as unknown) as ValidationInputData, this.categoryRules);
    }

    private async fetchTagIds(
        _source: null,
        args: CategoryInputData
    ): Promise<UnknownObject | UnknownObject[] | Error> {
        const addTagMethod = getHandlerMethod(Handlers.TAG, TagFunctions.ADD_TAG);

        const tags = args.data.tags.map((tag) => ({name: tag} as TagInput));

        return (await addTagMethod({}, {data: tags})) || [];
    }

    private static addCategoryPreprocessing(_source: null, args: CategoryInputData): UnknownObject {
        const data = args.data;

        data.tags = (args.dataFetchingResult as Tag[]).map((tag) => tag.id);
        data.allowedFileTypes = CategoryHandler.uniqueValues<FileType>(args.data.allowedFileTypes);

        return (data as unknown) as UnknownObject;
    }

    private static uniqueValues<T>(data: T[]): T[] {
        return data.filter((v, i, a) => a.indexOf(v) === i);
    }
}
