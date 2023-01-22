import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider, darkTheme, midnightTheme } from "@rainbow-me/rainbowkit";
import { chains, wagmiClient } from "./utils/rainbowkit_config";
// import SnackbarProvider from "react-simple-snackbar";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider theme={darkTheme()} chains={chains}>
      <App />
    </RainbowKitProvider>
  </WagmiConfig>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
