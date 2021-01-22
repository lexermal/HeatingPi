import * as React from "react"
import css from './Login.module.css';
import Toast from "../../utils/Toast";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useState } from "react"
import { LOGIN, mutation } from "../../utils/backendCalls";

export default function LoginView() {
    return <div className={css.background}>
        <div className="container">
            <h1 className={css.formHeading}>Login</h1>
            <div className={css.loginForm}>
                <div className={css.mainDiv}>
                    {renderForm()}
                </div>
            </div>
        </div>
    </div>
}

function renderForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const mutationResult = mutation(LOGIN, "user", { ignore: true })

    if (mutationResult.error) {
        console.log("Graphql error:", mutationResult.error)
        Toast.error("Change could not be saved. " + mutationResult.error)
    }

    if (mutationResult.data) {
        localStorage.setItem("token", mutationResult.data.login.token);
        router.push('../')
    }

    return <form id="Login" onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.checkValidity();
        mutationResult.fireMutation({ variables: { email: name, password: password } });
    }}>
        <div className="form-group">
            <input
                id="inputEmail"
                required={true}
                placeholder="User"
                className="form-control"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}/>
        </div>
        <div className="form-group">
            <input
                type="password"
                required={true}
                id="inputPassword"
                placeholder="Password"
                className="form-control"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}/>
        </div>
        <button type="submit" className="btn btn-primary" disabled={mutationResult.loading}>Login</button>
    </form>
}
