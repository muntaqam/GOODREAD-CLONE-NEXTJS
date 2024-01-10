import "../../styles/globals.css";


import { QueryClient, QueryClientProvider } from "react-query";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "../store/store";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </ReduxProvider>
  );
}

export default MyApp;
