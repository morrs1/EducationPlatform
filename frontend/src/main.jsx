import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { StoreProvider } from "./app/providers/StoreProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StoreProvider>
    <App />
  </StoreProvider>,
);
