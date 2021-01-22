import * as React from "react";
import SchemaView from '../views/Schema/SchemaView';
import AuthCheck from "../views/AuthCheck/AuthCheck";
import GenericView from "../views/GenericView/GenericView";

export default function Home() {
    return <AuthCheck>
        <GenericView/>
        <SchemaView/>
    </AuthCheck>
}
