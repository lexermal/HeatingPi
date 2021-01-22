import '../styles/globals.css'
import '../styles/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

import React from 'react';
import { setContext } from '@apollo/client/link/context';
import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache } from '@apollo/client';

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

const httpLink = createHttpLink({ uri: 'http://localhost:9000/graphql' });

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
});

export default function MyApp({ Component, pageProps }) {
    return <ApolloProvider client={client}>
        <Component {...pageProps} />
    </ApolloProvider>
}

