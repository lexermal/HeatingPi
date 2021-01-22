import React from "react";
import { DocumentNode, useQuery } from "@apollo/client";
import Loader from "../../components/loader/Loader";

export function queryHandler(query:DocumentNode, onComplete: (data: any) => JSX.Element) {
    const { loading, error, data } = useQuery(query);

    if (loading) {
        return <div>
            <p>Loading...</p>
            <Loader/>
        </div>;
    }

    if (error) {
        console.log("Graphqlerror", error)
        return <p>An error accured. Please reload the page</p>;
    }
    return onComplete(JSON.parse(JSON.stringify(data)));
}
