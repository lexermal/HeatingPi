import * as React from "react";
import AuthCheck from "../views/AuthCheck/AuthCheck";
import TemperatureView from "../views/Temperature/TemperatureView";
import GenericView from "../views/GenericView/GenericView";

export default function Home() {
    return <AuthCheck>
        <GenericView/>
        <TemperatureView/>
    </AuthCheck>
}
