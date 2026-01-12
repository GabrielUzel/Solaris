import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const getApiUrl = () => {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL;
  }
  return "http://localhost:4000/api/graphql";
};

const client = new ApolloClient({
  link: new HttpLink({
    uri: getApiUrl(),
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});

export default client;
