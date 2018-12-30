import * as React from "react"
import PinView from './views/Pins/PinView'
import SchemaView from './views/Schema/SchemaView'
import DashboardView from './views/Dashboard/DashboardView'
import {BrowserRouter as Router, Route} from "react-router-dom"

class Routing extends React.Component<{}, {}> {
    public render() {
        return <Router>
            <div>
                {this.props.children}
                <Route exact={true} path="/" component={DashboardView}/>
                <Route exact={true} path={"/pins"} component={PinView}/>
                <Route exact={true} path={"/schema"} component={SchemaView}/>
            </div>
        </Router>
    }

}

export default Routing
