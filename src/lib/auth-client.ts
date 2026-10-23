import { createAuthClient } from "better-auth/react";
import { API_ORIGIN } from "../api/instance";

export const authClient = createAuthClient({
  baseURL: API_ORIGIN,
});
