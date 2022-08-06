import { clientConfig } from "./firebase.config";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { getPerformance } from "firebase/performance";

const inDevelopment = process.env.NODE_ENV === "development";

// Initialize Firebase
export const firebase = initializeApp(clientConfig);

export const auth = getAuth(firebase);

export const analytics = getAnalytics(firebase);

export const performance = !inDevelopment ? getPerformance() : null;

if (process.env.NODE_ENV !== "production") {
  connectAuthEmulator(auth, "http://localhost:9099", {
    disableWarnings: true,
  });
}
