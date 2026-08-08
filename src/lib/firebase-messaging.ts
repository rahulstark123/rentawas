import admin from "firebase-admin";

type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

function getFirebaseApp(): admin.app.App | null {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) {
    console.warn("[push] FIREBASE_SERVICE_ACCOUNT_JSON is not set — push send disabled.");
    return null;
  }

  try {
    const serviceAccount = JSON.parse(raw) as admin.ServiceAccount;
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (err) {
    console.error("[push] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", err);
    return null;
  }
}

export async function sendFcmToTokens(
  tokens: string[],
  payload: PushPayload
): Promise<{ successCount: number; failureCount: number }> {
  const app = getFirebaseApp();
  if (!app || tokens.length === 0) {
    return { successCount: 0, failureCount: tokens.length };
  }

  const messaging = admin.messaging(app);
  const data = payload.data
    ? Object.fromEntries(
        Object.entries(payload.data).map(([k, v]) => [k, String(v)])
      )
    : undefined;

  const res = await messaging.sendEachForMulticast({
    tokens,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data,
    android: {
      priority: "high",
      notification: {
        channelId: "rentawas_default",
        color: "#FF6B00",
      },
    },
  });

  return {
    successCount: res.successCount,
    failureCount: res.failureCount,
  };
}
