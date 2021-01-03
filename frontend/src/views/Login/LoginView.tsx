import * as React from "react"
import * as toastr from "toastr"
import {Redirect} from "react-router"
import {ChangeEvent, FormEvent} from "react"
import BackendCalls from "../../utils/backendCalls"
import './Login.css'

class LoginView extends React.Component<{}, LoginState> {

    constructor(props: Readonly<{}>) {
        super(props)
        this.login = this.login.bind(this)
        this.onError = this.onError.bind(this)
        this.state = {isLoggedIn: false, user: "", password: ""}
    }

    public componentWillMount(): void {
        BackendCalls.checkLogin((result) => this.setState({isLoggedIn: result}))
    }

    public render() {
        if (this.state.isLoggedIn) {
            this.handleNavbar(false)
            console.log("[LoginView]redirect :",)

            const redirect = new URL(window.location.href).searchParams.get("redirect")
            console.log("[LoginView] :",redirect)
            return <Redirect to={redirect ? redirect : "/"}/>
        }

        return <div id="LoginForm">
            <div className="container">
                <h1 className="form-heading">Login</h1>
                <div className="login-form">
                    <div className="main-div">
                        <form id="Login" onSubmit={this.login}>
                            <div className="form-group">
                                <input required={true} className="form-control" id="inputEmail" placeholder="User"
                                       onChange={(e: ChangeEvent<HTMLInputElement>) => this.setState({user: e.target.value})}/>
                            </div>
                            <div className="form-group">
                                <input required={true} type="password" value={this.state.password} className="form-control" id="inputPassword" placeholder="Password"
                                       onChange={(e: ChangeEvent<HTMLInputElement>) => this.setState({password: e.target.value})}/>
                            </div>
                            <button type="submit" className="btn btn-primary">Login</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    }

    public componentDidMount(): void {
        this.handleNavbar(this.state.isLoggedIn)
    }

    public componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<LoginState>, snapshot?: any): void {
        this.handleNavbar(this.state.isLoggedIn)
    }

    private handleNavbar(show: boolean) {
        document.getElementById('navbar')!.setAttribute("style", "display:" + (show ? "visible" : "none"))
    }

    private login(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        e.stopPropagation()
        e.currentTarget.checkValidity()

        new BackendCalls().login(this.state.user, this.state.password, () => this.setState({isLoggedIn: true}), this.onError)
    }

    private onError(e: string) {
        toastr.error("Could not login. " + e)
        this.setState({password: ""})
    }
}

interface LoginState {
    user: string
    password: string
    isLoggedIn: boolean
}

export default LoginView