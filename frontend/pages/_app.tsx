import '../styles/globals.css'
import '../styles/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

import React from 'react';
import { setContext } from '@apollo/client/link/context';
import { ApolloClient, ApolloLink, ApolloProvider, createHttpLink, InMemoryCache } from '@apollo/client';
import { ToastContainer } from 'react-toastify';
import { onError } from "@apollo/client/link/error";
import Toast from "../utils/Toast";

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('token');

    if (token) {
        return {
            headers: {
                ...headers,
                authorization: `Bearer ${token}`
            }
        }
    }
    return { headers }
});
const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) => {
            console.log("Graphql error: ", message);
            Toast.error("Change could not be saved. " + message);
        })
    }
    if (networkError) {
        console.log(`Network error: ${networkError}`);
        Toast.error(`Network error: ${networkError}`);
    }
});

const httpLink = createHttpLink({ uri: process.env.NEXT_PUBLIC_BACKEND });

const client = new ApolloClient({
    link: ApolloLink.from([
        authLink,
        errorLink,
        httpLink
    ]),
    cache: new InMemoryCache()
});

export default function MyApp({ Component, pageProps }) {
    return <ApolloProvider client={client}>
        <ToastContainer/>
        <Component {...pageProps} />
    </ApolloProvider>
}

