import { ApolloError, DocumentNode, FetchResult, gql, MutationHookOptions, useMutation } from "@apollo/client";
import { MutationBaseOptions } from "@apollo/client/core/watchQueryOptions";
import Toast from "./Toast";

export const DASHBOARD = gql`
    query{
        temperature
        schema(active:true){
            name
            running
        }
        pins{
            id
            name
            active
        }
    }
`;

export const SETTINGS = gql`
    query{
        pins{
            id
            name
            activeByDefault
        }
        settings{
            oneSchemaMode
            multiSchemaPriority
        }
    }
`;

export const SCHEMA = gql`
    query{
        pins{
            id
            name
            activeByDefault
        }
        schema{
            id
            name
            active
            temperature{
                min
                max
            }
            pinModes{
                mode
                pin{
                    id
                    name
                }
            }
        }
    }
`;

export const USER = gql`
    query{
        currentUser{
            token
            id
            name
        }
    }
`;

export const TEMPERATURE_LOG = gql`
    query{
        temperatureLog{
            id
            date
            value
            simulated
        }
    }
`;

export const EDIT_PIN = gql`
    mutation($id:Int!,$name:String!,$activeByDefault:Boolean!){
        editPin(id:$id,name:$name,activeByDefault:$activeByDefault){
            id
            name
            active
            activeByDefault
        }
    }
`;

export const ADD_SCHEMA = gql`
    mutation($name:String!,$mode:[InputPinMode]!,$min:Float!, $max:Float!){
        addSchema(name:$name,mode:$mode,temperature:{min:$min,max:$max}){
            id
            name
            active
            temperature{
                min
                max
            }
            pinModes{
                mode
                pin{
                    id
                    name
                }
            }
        }
    }
`;

export const EDIT_SCHEMA = gql`
    mutation($id:String!,$name:String!,$mode:[InputPinMode]!,$min:Float!, $max:Float!){
        editSchema(id:$id,name:$name,mode:$mode,temperature:{min:$min,max:$max}){
            id
            name
            active
            temperature{
                min
                max
            }
            pinModes{
                mode
                pin{
                    id
                    name
                }
            }
        }
    }
`;

export const DELETE_SCHEMA = gql`
    mutation($id:String!){
        deleteSchema(id:$id){
            id
            name
            active
        }
    }
`;

export const ACTIVATE_SCHEMA = gql`
    mutation($id:String!,$active:Boolean!){
        activateSchema(id:$id,active:$active){
            id
            name
        }
    }
`;

export const LOGIN = gql`
    mutation($email:String!, $password:String!){
        login(email:$email,password:$password){
            id
            name
            email
            token
            role
        }
    }
`;

export const APPLY_SETTINGS = gql`
    mutation($one:Boolean!,$priority:String!){
        applySettings(settings:{oneSchemaMode:$one,multiSchemaPriority:$priority}){
            oneSchemaMode
            multiSchemaPriority
        }
    }
`;

export const SchemaFragment = gql`
    fragment NewSchema on Schema {
        id
        name
        pinModes
        temperature
    }
`;

export interface Operation {
    add?: {
        mutationName: string
        mutationFragment: DocumentNode
    }
    edit?: true
    delete?: {
        mutationName: string
    }
    set?: {
        query: DocumentNode
        variables?: Record<string, any>
    }
    ignore?: true
}

interface OnFunctions {
    onComplete?: (data: any) => any
    onError?: (error: ApolloError) => any
}

export function mutation(gqlMutation: DocumentNode, field: string, operation: Operation, on?: OnFunctions) {
    const cacheInteraction = {
        onCompleted: (data) => on?.onComplete(data),
        onError: (data: ApolloError) => on?.onError(data),
        update(cache, { data }) {
            cache.modify({
                fields: {
                    [field]: (existingCachedObjects = []) => {

                        if (operation.edit || operation.set || operation.ignore) {
                            return existingCachedObjects
                        }

                        if (operation.delete) {
                            return existingCachedObjects.filter(value => {
                                return !value.__ref.includes(data[operation.delete.mutationName].id)
                            })
                        }

                        //add operation
                        const newRef = cache.writeFragment({
                            data: data[operation.add.mutationName],
                            fragment: operation.add.mutationFragment
                        })

                        return [...existingCachedObjects, newRef]
                    }
                }
            });
        },
    } as MutationHookOptions;

    if (operation.set) {
        cacheInteraction.refetchQueries = [{
            query: operation.set.query,
            variables: operation.set.variables
        }]
    }
    const mutationData = useMutation(gqlMutation, cacheInteraction);

    return {
        data: mutationData[1].data,
        error: mutationData[1].error,
        loading: mutationData[1].loading,
        fireMutation: (...data) => (mutationData[0] as MutationMethod)(...data).catch(() => undefined)
    }
}

export type MutationMethod = (options?: MutationBaseOptions) => Promise<FetchResult>;

/**
 * This function handles the whole process of using mutations. Only one mutation per mutation handler can be used.
 * @param gqlMutation is the graphql mutation query.
 * @param field the query field that will be modified in the cache. eg. schema
 * @param operation If the query adds, edits or deletes something
 * @return returns the mutation method that needs to be triggered if the data should be changed on the backend.
 */
export function mutationHandler(gqlMutation: DocumentNode, field: string, operation: Operation): MutationMethod {
    const result = mutation(gqlMutation, field, operation, {
        onComplete: data => {
            Toast.success("The changes have been successfully saved.")
        }
    });

    return result.fireMutation;
}

