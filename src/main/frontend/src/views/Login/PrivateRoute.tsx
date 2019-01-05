import * as React from "react"
import {Redirect, Route, RouteComponentProps, RouteProps} from "react-router-dom"
import BackendCalls from "../../utils/backendCalls";

type RouteComponent = React.StatelessComponent<RouteComponentProps<{}>> | React.ComponentClass<any>

export const PrivateRoute: React.StatelessComponent<RouteProps> = ({component, ...rest}) => {
    const renderFn = (Component?: RouteComponent) => (props: RouteProps) => {
        if (!Component) {
            return null
        }

        if (BackendCalls.isLoggedIn()) {
            // @ts-ignore
            return <Component  {...props} />
        }

        return <Redirect to={{pathname: "/login", state: {from: props.location}}}/>
    }

    return <Route {...rest} render={renderFn(component)}/>
}

