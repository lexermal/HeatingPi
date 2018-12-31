import * as React from "react"
import PinView from './views/Pins/PinView'
import SchemaView from './views/Schema/SchemaView'
import DashboardView from './views/Dashboard/DashboardView'
import {BrowserRouter as Router, Route, Switch} from "react-router-dom"
import LoginView from "./views/Login/LoginView";
import {PrivateRoute} from "./views/Login/PrivateRoute";

class Routing extends React.Component<{}, {}> {
    public render() {
        return <Router>
            <div style={{minHeight: "100vh"}}>
                {this.props.children}
                <Switch>
                    <PrivateRoute exact={true} path="/" component={DashboardView}/>
                    <PrivateRoute exact={true} path={"/pins"} component={PinView}/>
                    <PrivateRoute exact={true} path={"/schema"} component={SchemaView}/>
                    <Route exact={true} path="/login" component={LoginView}/>
                    <Route component={LoginView}/>
                </Switch>
            </div>
        </Router>
    }

}

export default Routing
