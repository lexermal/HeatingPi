import HandlerGenerator, {GenericCrudConfig, GenericHandlerResult, GenericQueryConfig} from "../_BasicBackend/handlerCreation/HandlerGenerator";

export type GenericInputData<T> = {
    data: T;
    dataFetchingResult: any;
};

export abstract class BasicHandler {
    protected abstract table: string;

    //todo soll map returnen key ist die enum
    public getMethodPool(): GenericHandlerResult {
        return HandlerGenerator.generateMethods(this.table, this.getCrudConfig(), this.getQueryConfig());
    }

    protected abstract getCrudConfig(): GenericCrudConfig;

    protected abstract getQueryConfig(): GenericQueryConfig;
}
