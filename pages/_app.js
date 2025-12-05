import { useEffect } from "react";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {

  useEffect(() => {
    if ("serviceWorker" in navigator) {

      // Register the service worker
      navigator.serviceWorker.register("/service-worker.js").catch((err) => {
        console.error("SW registration failed:", err);
      });

      // Auto-update: reload app when a new SW takes control
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
