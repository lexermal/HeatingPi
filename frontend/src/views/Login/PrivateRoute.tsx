import * as React from "react"
import {Redirect, Route, RouteComponentProps, RouteProps} from "react-router-dom"
import BackendCalls from "../../utils/backendCalls";

type RouteComponent = React.FunctionComponent<RouteComponentProps<{}>> | React.ComponentClass<any>

export const PrivateRoute: React.FunctionComponent<RouteProps> = ({component, ...rest}) => {
    const renderFn = (Component?: RouteComponent) => () => {

        const url = window.location.pathname
        console.log("[PrivateRoute]security check :",url)

        // @ts-ignore
        return BackendCalls.isLoggedIn() ? <Component {...component} /> :
            <Redirect to={{pathname: "/login" + (url === '/' ? "" : "?redirect=" + url)}}/>;
    }

    return <Route {...rest} render={renderFn(component)}/>
}

