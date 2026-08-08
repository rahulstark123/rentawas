import admin from "firebase-admin";

type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

export type FcmSendResult = {
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
  errors: Array<{ code?: string; message?: string }>;
};

function normalizePrivateKey(key: string): string {
  return key.replace(/\\n/g, "\n");
}

function parseServiceAccountJson(raw: string): (admin.ServiceAccount & { private_key?: string }) | null {
  let json = raw.trim();
  if (!json) return null;

  const attempts = [json];

  // Common .env mistake: literal \" instead of "
  if (json.includes('\\"')) {
    attempts.push(json.split('\\"').join('"'));
  }

  // Literal backslash + newline inside JSON strings (invalid JSON)
  attempts.push(
    ...attempts.map((candidate) => candidate.replace(/\\\r?\n/g, "\\n"))
  );

  for (const candidate of [...new Set(attempts)]) {
    try {
      const parsed = JSON.parse(candidate) as admin.ServiceAccount & {
        private_key?: string;
      };
      if (parsed.private_key) {
        parsed.private_key = normalizePrivateKey(parsed.private_key);
      }
      return parsed;
    } catch {
      // try next normalization
    }
  }

  return null;
}

function loadServiceAccount(): admin.ServiceAccount | null {
  const jsonRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (jsonRaw) {
    const parsed = parseServiceAccountJson(jsonRaw);
    if (parsed) return parsed;
    console.error("[push] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON.");
    return null;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY?.trim();

  if (projectId && clientEmail && privateKeyRaw) {
    return {
      projectId,
      clientEmail,
      privateKey: normalizePrivateKey(privateKeyRaw),
    };
  }

  return null;
}

function getFirebaseApp(): admin.app.App | null {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    console.warn(
      "[push] Firebase not configured — set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY."
    );
    return null;
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (err) {
    console.error("[push] Firebase initializeApp failed:", err);
    return null;
  }
}

/** Check Firebase Admin can initialize (for health/debug). */
export function isFirebaseMessagingConfigured(): boolean {
  return getFirebaseApp() !== null;
}

export function getFirebaseMessagingStatus(): {
  configured: boolean;
  source: "json" | "split" | "none";
  error: string | null;
} {
  const jsonRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (jsonRaw) {
    const parsed = parseServiceAccountJson(jsonRaw);
    if (!parsed) {
      return {
        configured: false,
        source: "json",
        error: "FIREBASE_SERVICE_ACCOUNT_JSON is set but could not be parsed.",
      };
    }
    try {
      const ok = getFirebaseApp() !== null;
      return {
        configured: ok,
        source: "json",
        error: ok ? null : "Firebase initializeApp failed.",
      };
    } catch (err: any) {
      return {
        configured: false,
        source: "json",
        error: err?.message || "Firebase initializeApp failed.",
      };
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY?.trim();
  if (projectId && clientEmail && privateKeyRaw) {
    const ok = getFirebaseApp() !== null;
    return {
      configured: ok,
      source: "split",
      error: ok ? null : "Firebase initializeApp failed.",
    };
  }

  return {
    configured: false,
    source: "none",
    error: "Firebase env not set.",
  };
}

export async function sendFcmToTokens(
  tokens: string[],
  payload: PushPayload
): Promise<FcmSendResult> {
  const app = getFirebaseApp();
  if (!app || tokens.length === 0) {
    return {
      successCount: 0,
      failureCount: tokens.length,
      invalidTokens: [],
      errors: [],
    };
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

  const invalidTokens: string[] = [];
  const errors: Array<{ code?: string; message?: string }> = [];

  res.responses.forEach((response, index) => {
    if (response.success) return;

    const err = response.error;
    const code = err?.code;
    const message = err?.message;
    errors.push({ code, message });
    console.error(`[push] FCM send failed [${index}]:`, code, message);

    if (
      code === "messaging/registration-token-not-registered" ||
      code === "messaging/invalid-registration-token"
    ) {
      invalidTokens.push(tokens[index]);
    }
  });

  if (res.successCount > 0) {
    console.log(`[push] FCM sent ${res.successCount}/${tokens.length} message(s).`);
  }

  return {
    successCount: res.successCount,
    failureCount: res.failureCount,
    invalidTokens,
    errors,
  };
}
