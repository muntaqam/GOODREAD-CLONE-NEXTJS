import "../../styles/globals.css";

import { QueryClient, QueryClientProvider } from "react-query";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "../store/store";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import Script from "next/script"; // ✅ Required for GA

config.autoAddCss = false;
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* ✅ Google Analytics */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-1WN57SLH26"
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1WN57SLH26', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </ReduxProvider>
    </>
  );
}

export default MyApp;
