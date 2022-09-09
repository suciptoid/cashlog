import clientConfig from "../../firebase.config.json";
import type {
  ActionFunction,
  AppLoadContext,
  LoaderFunction,
} from "@remix-run/node";
import type { UserRecord } from "firebase-admin/auth";
import type { Params } from "react-router";
import { auth, firestore } from "~/lib/firebase.server";

export interface MockedUser {
  user: UserRecord;
  session: string;
  token: string;
  remove: () => Promise<void>;
}

interface EmulatorUserPayload {
  email: string;
  password: string;
}

const createEmulatorUser = async (payload: EmulatorUserPayload) => {
  const user = await auth.createUser(payload);
  const authURL = `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${clientConfig.apiKey}`;
  const req = await fetch(authURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const res = await req.json();
  if (!res.idToken) {
    throw new Error("Emulator user creation failed");
  }
  return {
    user,
    token: res.idToken,
  };
};
export const createTestUser = async (): Promise<MockedUser> => {
  const randomName = () => Math.random().toString(36).substring(2, 15);
  const { user, token } = await createEmulatorUser({
    email: `user-${randomName()}@test.dev`,
    password: "secret",
  });
  const session = await auth.createSessionCookie(token, {
    expiresIn: 1 * 60 * 60 * 1000,
  });

  const remove = async () => {
    await auth.deleteUser(user.uid);
  };

  return {
    token,
    user,
    session,
    remove,
  };
};

export const cleanUserCollection = async (userId: string) => {
  const collections = ["budgets", "transactions", "categories", "accounts"];
  // Delete user profile
  firestore.collection("users").doc(userId).delete();

  // Delete Subcollections
  for (const collection of collections) {
    const docs = await firestore
      .collection(`users/${userId}/${collection}`)
      .listDocuments();

    docs.forEach(async (doc) => {
      await doc.delete();
    });
  }
};

export const createRequest = async (
  handler: LoaderFunction | ActionFunction,
  request: Request,
  params?: Params,
  context?: AppLoadContext
): Promise<Response> => {
  try {
    const res = await handler({
      request,
      params: params || {},
      context: context || {},
    });
    return res;
  } catch (e) {
    if (e instanceof Response) {
      return e;
    } else {
      throw e;
    }
  }
};
