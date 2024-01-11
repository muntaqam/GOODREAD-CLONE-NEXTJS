import "../../styles/globals.css";

import { QueryClient, QueryClientProvider } from "react-query";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "../store/store";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";

// Prevent fontawesome from dynamically adding its css since we did it manually above
config.autoAddCss = false;
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
