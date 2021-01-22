import * as React from "react";
import AuthCheck from "../views/AuthCheck/AuthCheck";
import SettingView from '../views/Settings/SettingView';
import GenericView from "../views/GenericView/GenericView";

export default function Home() {
    return <AuthCheck>
        <GenericView/>
        <SettingView/>
    </AuthCheck>
}
