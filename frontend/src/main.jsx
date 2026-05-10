import ReactDOM from "react-dom/client";
import App from "./app/entry";
import "./index.css";
import { StoreProvider } from "./app/providers";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StoreProvider>
    <App />
  </StoreProvider>,
);
