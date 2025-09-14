'use client'

import { ApolloClient, InMemoryCache, ApolloProvider, ApolloLink, createHttpLink } from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import React from "react";

// This is the correct client setup with JWT and a fallback for server-side rendering.
const createApolloClient = () => {
    const authLink = setContext((_, { headers }) => {
        const JWTToken = localStorage.getItem("JWTToken")

        // This is the correct header format for graphql-jwt.
        const AuthHeader = JWTToken ? `JWT ${JWTToken}` : '';


        return {
            headers: {
                ...headers,
                ...(JWTToken && { authorization: AuthHeader })
            }
        };
    });

    const httpLink = createHttpLink({
        uri: "http://localhost:8000/graphql",
    });

    return new ApolloClient({
        link: ApolloLink.from([authLink, httpLink]),
        cache: new InMemoryCache(),
        ssrMode: typeof window === 'undefined',
    });
};

const client = createApolloClient();

// This component ensures the ApolloProvider is only used in the client context.
export default client;