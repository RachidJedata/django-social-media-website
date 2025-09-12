import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';

const httpLink = new HttpLink({
    uri: 'http://localhost:8000/graphql',
});

const authLink = new SetContextLink((prevContext, operation) => {
    const token = localStorage.getItem('jwtToken');
    return {
        headers: {
            ...(prevContext.headers || {}),
            authorization: token ? `JWT ${token}` : '',
        }
    };
});

// Compose the links
const link = ApolloLink.from([authLink, httpLink]);

const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
});

export default client;
