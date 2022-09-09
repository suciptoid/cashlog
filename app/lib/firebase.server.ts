import config from "../../firebase.config.json";
import { apps, credential as adminCredential } from "firebase-admin";
import type { App, Credential } from "firebase-admin/app";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { getFirestore } from "firebase-admin/firestore";

let app: App;
let credential: Credential;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  const saKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  credential = adminCredential.cert({
    projectId: saKey.project_id,
    clientEmail: saKey.client_email,
    privateKey: saKey.private_key.replace(/\\n/g, "\n"),
  });
} else {
  credential = applicationDefault();
}

if (apps.length === 0) {
  app = initializeApp({
    credential,
    databaseURL:
      process.env.FIREBASE_DATABASE_URL ||
      `https://${config.projectId}-default-rtdb.firebaseio.com`,
  });
} else {
  app = apps[0]!;
}

export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const database = getDatabase(app);

export * from "firebase-admin/firestore";
