import * as React from "react";
import {BrowserRouter as Router, Route, Link} from "react-router-dom";

class RouteMain extends React.Component<{}, {}> {


    constructor(props: {}, context: any) {
        super(props, context)
        // console.log(234)
    }

    public render() {
        return <Router>
            <div>
                <this.Header/>

                <Route exact={true} path="/" component={this.Home}/>
                <Route path="/about" component={this.About}/>
                <Route path="/topics" component={this.Topics}/>
            </div>
        </Router>
    };

    private Home() {
        return <div><h2>Home</h2>Home page, have fun </div>
    }

    private About() {
        return <h2>About</h2>
    }

    // private Topic(match: any) {
    //     return <h3>Requested Param: {match.params.id}</h3>
    // }

    private Topics(match: any) {
        // console.log("matches " , match)


        const defaultroute = (url: any) => {
            console.log(url)
            return <h3>Requested Param: {url.match.params.id}</h3>
        }

        const Select = () => {
            return <h3>Please select a topic.</h3>
        }
        return <div>
            <h2>Topics</h2>

            <ul>
                <li>
                    <Link to={`${match.match.url}/components`}>Components</Link>
                </li>
                <li>
                    <Link to={`${match.match.url}/props-v-state`}>Props v. State</Link>
                </li>
            </ul>

            <Route path={`${match.match.path}/:id`} component={defaultroute}/>
            <Route
                exact={true}
                path={match.match.path}
                render={Select}
            />
        </div>
    }


    private Header() {
        return <ul>
            <li>
                <Link to="/">Home</Link>
            </li>
            <li>
                <Link to="/about">About</Link>
            </li>
            <li>
                <Link to="/topics">Topics</Link>
            </li>
        </ul>
    }
}

export default RouteMain;
