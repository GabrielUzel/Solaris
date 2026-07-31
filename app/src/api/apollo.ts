import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const getApiUrl = () => {
  if (import.meta.env.DEV) {
    return "/graphql";
  }

  return "http://127.0.0.1:4000/api/graphql";
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
