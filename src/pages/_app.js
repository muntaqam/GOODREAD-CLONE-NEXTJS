import "../../styles/globals.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../store/store"; // Make sure to import persistor as well

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        {" "}
        {/* Add PersistGate here */}
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </PersistGate>
    </ReduxProvider>
  );
}

export default MyApp;
