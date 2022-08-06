import { action, loader } from "./$id";
import dayjs from "dayjs";
import type { DocumentReference } from "firebase-admin/firestore";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { sessionCookie } from "~/lib/cookies";
import { accountCollection } from "~/models/account";
import { budgetCollection } from "~/models/budget";
import { categoryCollection } from "~/models/category";
import type { TransactionEntity } from "~/models/transaction";
import { transactionCollection } from "~/models/transaction";
import type { MockedUser } from "~/tests/utils";
import {
  cleanUserCollection,
  createRequest,
  createTestUser,
} from "~/tests/utils";

describe("updating transaction restore budget", () => {
  let user: MockedUser;
  beforeEach(async () => {
    user = await createTestUser();
  });

  afterEach(async () => {
    await user?.remove();
    await cleanUserCollection(user?.user.uid);
  });

  it("return 404 if trx not found", async () => {
    const request = new Request("http://n", {
      method: "get",
      headers: {
        Cookie: await sessionCookie.serialize(user.session),
      },
    });
    try {
      await loader({
        request,
        params: { id: "1" },
        context: {},
      });
    } catch (e) {
      if (e instanceof Response) {
        expect(e.status).toBe(404);
      }
    }
  });

  it("return trx record", async () => {
    const ref = transactionCollection(user.user.uid).doc();
    await ref.set({
      amount: 100,
      account_id: "1",
      category_id: "1",
      time: Date.now(),
      created_at: Date.now(),
      updated_at: Date.now(),
      description: "test",
      id: ref.id,
      user_id: user.user.uid,
    });
    const trx = await ref.get();
    const request = new Request("http://n", {
      method: "get",
      headers: {
        Cookie: await sessionCookie.serialize(user.session),
      },
    });
    const res = await createRequest(loader, request, { id: trx.id });
    const data = await res.json();
    expect(data.id).toBe(trx.id);
    expect(data.description).toBe("test");
  });
});

describe("update budget", () => {
  let accRef: DocumentReference;
  let catRef: DocumentReference;
  let trxRef: DocumentReference;
  let user: MockedUser;

  beforeAll(async () => {
    user = await createTestUser();
  });
  afterAll(async () => {
    await user?.remove();
  });

  beforeEach(async () => {
    // Create category & account
    accRef = accountCollection(user.user.uid).doc();
    await accRef.set({
      id: accRef.id,
      name: "test",
      user_id: user.user.uid,
      created_at: Date.now(),
      updated_at: Date.now(),
      account_number: "123",
      balance: 100,
      currency: "USD",
    });
    catRef = categoryCollection(user.user.uid).doc();
    await catRef.set({
      id: catRef.id,
      name: "test",
      user_id: user.user.uid,
      created_at: Date.now(),
      updated_at: Date.now(),
      spending: true,
    });

    // Create transaction on db
    trxRef = transactionCollection(user.user.uid).doc();
    await trxRef.set({
      amount: -100,
      account_id: accRef.id,
      category_id: catRef.id,
      time: Date.now(),
      created_at: Date.now(),
      updated_at: Date.now(),
      description: "test",
      id: trxRef.id,
      user_id: user.user.uid,
    });
  });

  afterEach(async () => {
    await cleanUserCollection(user?.user.uid);
  });

  it("update account balance on transaction update amount", async () => {
    let acc = await accRef.get();
    let trx = await trxRef.get();
    let cat = await catRef.get();

    expect(cat.data()?.spending).toBe(true);
    expect(acc.data()?.balance).toBe(100);
    expect(trx.data()?.amount).toBe(-100);
    // Update trx amount
    const form = new FormData();
    const data = {
      ...trx.data(),
      amount: 50,
    } as TransactionEntity;
    // map data to form
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        // @ts-ignore
        form.append(key, data[key]);
      }
    }

    const request = new Request("http://n", {
      method: "patch",
      headers: {
        Cookie: await sessionCookie.serialize(user.session),
      },
      body: form,
    });
    const res = await createRequest(action, request, { id: trx.id });
    expect(res.status).toBe(302);
    trx = await trxRef.get();
    acc = await accRef.get();
    expect(acc.data()?.balance).toBe(150);
    expect(trx.data()?.amount).toBe(-50);
  });

  it("restore account balance on trx delete", async () => {
    const request = new Request("http://n", {
      method: "delete",
      headers: {
        Cookie: await sessionCookie.serialize(user.session),
      },
    });
    const res = await createRequest(action, request, { id: trxRef.id });
    expect(res.status).toBe(302);
    const acc = await accRef.get();
    expect(acc.data()?.balance).toBe(200);
    const trx = await trxRef.get();
    expect(trx.exists).toBe(false);
  });

  it.each([[200], [100], [50]])(
    "restore budget balance on update trx amount to %i",
    async (amount) => {
      const budgetRef = budgetCollection(user.user.uid).doc();
      await budgetRef.set({
        id: budgetRef.id,
        user_id: user.user.uid,
        created_at: Date.now(),
        updated_at: Date.now(),
        amount: 400,
        used: 100,
        category_id: catRef.id,
        start: dayjs().startOf("month").valueOf(),
        end: dayjs().endOf("month").valueOf(),
      });

      const trx = await trxRef.get();
      const form = new FormData();
      const data = {
        ...trx.data(),
        amount,
      } as TransactionEntity;
      // map data to form
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          // @ts-ignore
          form.append(key, data[key]);
        }
      }

      const request = new Request("http://n", {
        method: "patch",
        headers: {
          Cookie: await sessionCookie.serialize(user.session),
        },
        body: form,
      });
      const res = await createRequest(action, request, { id: trx.id });
      expect(res.status).toBe(302);
      const budget = await budgetRef.get();
      expect(budget.data()?.used).toBe(amount);
    }
  );
});
