import * as React from "react"
import {Redirect} from "react-router"
import './Login.css'
import {FormEvent} from "react"
import BackendCalls from "../../utils/backendCalls"
import * as toastr from "toastr"

class LoginView extends React.Component<{}, LoginState> {
    private backend: BackendCalls

    constructor(props: Readonly<{}>) {
        super(props)
        this.backend = new BackendCalls()
        this.login = this.login.bind(this)
        this.state = {isLoggedIn: this.backend.isLoggedIn()}
    }

    public render() {
        if (this.state.isLoggedIn) {
            this.handleNavbar(false)
            return <Redirect to={"/"}/>
        }

        return (
            <div id="LoginForm">
                <div className="container">
                    <h1 className="form-heading">Login</h1>
                    <div className="login-form">
                        <div className="main-div">
                            <form id="Login" onSubmit={this.login}>
                                <div className="form-group">
                                    <input required={true} className="form-control" id="inputEmail" placeholder="User"/>
                                </div>
                                <div className="form-group">
                                    <input required={true} type="password" className="form-control" id="inputPassword" placeholder="Password"/>
                                </div>
                                <button type="submit" className="btn btn-primary">Login</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    public componentDidMount(): void {
        this.handleNavbar(this.state.isLoggedIn)
    }

    public componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<LoginState>, snapshot?: any): void {
        this.setState({isLoggedIn: this.backend.isLoggedIn()})
        this.handleNavbar(this.state.isLoggedIn)
    }

    private handleNavbar(show: boolean) {
        document.getElementById('navbar')!.setAttribute("style", "display:" + (show ? "visible" : "none"))

    }

    private login(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        e.stopPropagation()
        e.currentTarget.checkValidity()

        this.backend.login((e.currentTarget[0] as HTMLInputElement).value, (e.currentTarget[1] as HTMLInputElement).value,
            () => this.setState({isLoggedIn: true}), this.onError)
    }

    private onError(e: string) {
        toastr.error("Couldn't save changes. " + e)
    }
}

interface LoginState {
    isLoggedIn: boolean
}

export default LoginView