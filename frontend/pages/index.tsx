import * as React from "react";
import GenericView from "../views/GenericView/GenericView";
import DashboardView from '../views/Dashboard/DashboardView';
import AuthCheck from "../views/AuthCheck/AuthCheck";

export default function Home() {
    return <AuthCheck>
        <GenericView/>
        <DashboardView/>
    </AuthCheck>
}
