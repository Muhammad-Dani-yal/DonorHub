import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import donorsReducer from "../features/donors/donorsSlice";
import requestsReducer from "../features/requests/requestsSlice";

export const store = configureStore({
  reducer: { auth: authReducer, donors: donorsReducer, requests: requestsReducer },
});
