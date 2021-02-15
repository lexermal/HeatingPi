import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client';
import { USER } from "../../utils/backendCalls";

export default function AuthCheck(props: { children: JSX.Element | JSX.Element[] }): JSX.Element {
    const { error, data } = useQuery(USER);
    const router = useRouter();

    useEffect(() => {
        if (error) {
            console.log("login failed", error)
            localStorage.removeItem('token');

            router.push('/login')
        }
    })

    if (data) {
        return <>{props.children}</>;
    }

    return <p>Redirecting...</p>
}
