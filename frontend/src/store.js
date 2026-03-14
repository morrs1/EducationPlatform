import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import catalogReducer from "./features/catalog/catalogSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    catalog: catalogReducer,
  },
});

export default store;
