import cors from "cors";
import express from "express";
import {PORT} from "../Config";
import Log from "./utils/Logger";
import {createServer} from "http";
import compression from "compression";
import {GraphQLError} from "graphql";
import {setupFileAPI} from "./dal/Upload";
import ResolverMap from "./ResolverMap";
import depthLimit from "graphql-depth-limit";
import {ApolloServer} from "apollo-server-express";

const schema = ResolverMap.getSchema();
const log = Log.getInstance();
const app = express();
app.use("*", cors());
app.use(compression());

const server = new ApolloServer({
    schema,
    validationRules: [depthLimit(7)],
    formatError(err): GraphQLError {
        log.error("Graphql error: " + err.message, err);
        return err;
    },
});

server.applyMiddleware({app, path: "/graphql"});
setupFileAPI(app).then();

createServer(app).listen({port: PORT}, (): void => {
    log.info(`GraphQL is running on http://localhost:${PORT}/graphql`);
});
