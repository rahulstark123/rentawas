import { prisma } from "@/lib/prisma";
import { sendFcmToTokens } from "@/lib/firebase-messaging";

export async function removeInvalidPushTokens(tokens: string[]) {
  const unique = [...new Set(tokens.filter(Boolean))];
  if (unique.length === 0) return { count: 0 };

  const result = await prisma.pushDevice.deleteMany({
    where: { token: { in: unique } },
  });

  if (result.count > 0) {
    console.log(`[push] Removed ${result.count} invalid FCM token(s).`);
  }

  return result;
}

async function sendAndCleanupTokens(
  tokens: string[],
  payload: { title: string; body: string; data?: Record<string, string> }
) {
  const result = await sendFcmToTokens(tokens, payload);

  if (result.invalidTokens.length > 0) {
    await removeInvalidPushTokens(result.invalidTokens);
  }

  return { sent: result.successCount, failed: result.failureCount };
}

export async function registerPushDevice(params: {
  profileId: string;
  token: string;
  platform: string;
  deviceId?: string | null;
}) {
  const token = params.token.trim();
  if (!token) {
    throw new Error("Push token is required.");
  }

  return prisma.pushDevice.upsert({
    where: { token },
    create: {
      profileId: params.profileId,
      token,
      platform: params.platform,
      deviceId: params.deviceId || null,
    },
    update: {
      profileId: params.profileId,
      platform: params.platform,
      deviceId: params.deviceId || null,
    },
  });
}

export async function unregisterPushDevice(profileId: string, token: string) {
  const trimmed = token.trim();
  if (!trimmed) return { count: 0 };

  return prisma.pushDevice.deleteMany({
    where: { profileId, token: trimmed },
  });
}

export async function sendPushToProfile(
  profileId: string,
  payload: { title: string; body: string; data?: Record<string, string> }
) {
  const devices = await prisma.pushDevice.findMany({
    where: { profileId },
    select: { token: true },
  });

  if (devices.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const result = await sendAndCleanupTokens(
    devices.map((d) => d.token),
    payload
  );

  return { sent: result.sent, failed: result.failed };
}

export async function sendPushToProfiles(
  profileIds: string[],
  payload: { title: string; body: string; data?: Record<string, string> }
) {
  const uniqueIds = [...new Set(profileIds.filter(Boolean))];
  if (uniqueIds.length === 0) return { sent: 0, failed: 0 };

  const devices = await prisma.pushDevice.findMany({
    where: { profileId: { in: uniqueIds } },
    select: { token: true },
  });

  if (devices.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const result = await sendAndCleanupTokens(
    devices.map((d) => d.token),
    payload
  );

  return { sent: result.sent, failed: result.failed };
}

type AnnouncementTarget = {
  id: string;
  title: string;
  content: string;
  category?: string | null;
  priority?: string | null;
  targetScope: string;
  targetProperties: string[];
  targetTenants: string[];
};

async function profileIdForEmail(email: string): Promise<string | null> {
  const profile = await prisma.profile.findFirst({
    where: { email: { equals: email.trim(), mode: "insensitive" } },
    select: { id: true },
  });
  return profile?.id ?? null;
}

function truncatePushBody(text: string, max = 160): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function formatRentPushAmount(amount: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(amount);
}

function gatewayLabel(method?: string | null): string | null {
  const m = (method || "").toLowerCase();
  if (m.includes("stripe")) return "Stripe";
  if (m.includes("razorpay")) return "Razorpay";
  if (m.includes("paypal")) return "PayPal";
  return null;
}

/** Resolve tenant profile for push delivery. */
export async function resolveTenantProfileId(tenantId: string): Promise<string | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { profileId: true, email: true },
  });
  if (!tenant) return null;
  if (tenant.profileId) return tenant.profileId;
  return profileIdForEmail(tenant.email);
}

/** Resolve tenant profile IDs who should receive an announcement push (excludes creator). */
export async function resolveAnnouncementRecipientProfileIds(
  workspaceId: number,
  announcement: Pick<
    AnnouncementTarget,
    "targetScope" | "targetProperties" | "targetTenants"
  >,
  excludeProfileId?: string | null
): Promise<string[]> {
  const profileIds = new Set<string>();

  let tenants = await prisma.tenant.findMany({
    where: {
      workspaceId,
      currentStatus: { notIn: ["Exited", "Evicted", "Past"] },
    },
    select: { id: true, email: true, profileId: true, propertyId: true },
  });

  if (announcement.targetScope === "SPECIFIC_PROPERTIES") {
    const propertyIds = announcement.targetProperties || [];
    tenants = tenants.filter(
      (t) => t.propertyId && propertyIds.includes(t.propertyId)
    );
  } else if (announcement.targetScope === "SPECIFIC_TENANTS") {
    const targets = (announcement.targetTenants || []).map((t) =>
      t.toLowerCase()
    );
    tenants = tenants.filter(
      (t) =>
        targets.includes(t.email.toLowerCase()) || targets.includes(t.id)
    );
  }

  for (const tenant of tenants) {
    if (tenant.profileId) {
      profileIds.add(tenant.profileId);
    } else {
      const profileId = await profileIdForEmail(tenant.email);
      if (profileId) profileIds.add(profileId);
    }
  }

  if (excludeProfileId) {
    profileIds.delete(excludeProfileId);
  }

  return [...profileIds];
}

/** Fire FCM pushes for a new announcement — everyone targeted except the creator. */
export async function sendAnnouncementPush(
  announcement: AnnouncementTarget,
  workspaceId: number,
  creatorProfileId?: string | null
) {
  const recipientProfileIds = await resolveAnnouncementRecipientProfileIds(
    workspaceId,
    announcement,
    creatorProfileId
  );

  if (recipientProfileIds.length === 0) {
    return { sent: 0, failed: 0, recipients: 0 };
  }

  const priorityPrefix =
    announcement.priority === "Urgent"
      ? "🚨 Urgent: "
      : announcement.priority === "Important"
        ? "Important: "
        : "";

  const body = truncatePushBody(announcement.content);
  const title = `${priorityPrefix}${announcement.title}`;

  const result = await sendPushToProfiles(recipientProfileIds, {
    title,
    body,
    data: {
      screen: "notices",
      role: "TENANT",
      announcementId: announcement.id,
      category: announcement.category || "General Notice",
    },
  });

  return {
    sent: result.sent,
    failed: result.failed,
    recipients: recipientProfileIds.length,
  };
}

/** Workspace owner + active team members with linked profiles (excludes optional profile). */
export async function resolveWorkspaceOwnerAndTeamProfileIds(
  workspaceId: number,
  excludeProfileId?: string | null
): Promise<string[]> {
  const profileIds = new Set<string>();

  const workspace = await prisma.workspace.findUnique({
    where: { wid: workspaceId },
    select: { ownerId: true },
  });

  if (workspace?.ownerId) {
    profileIds.add(workspace.ownerId);
  }

  const teamMembers = await prisma.teamMember.findMany({
    where: { workspaceId, status: "Active" },
    select: { email: true },
  });

  for (const member of teamMembers) {
    const profileId = await profileIdForEmail(member.email);
    if (profileId) profileIds.add(profileId);
  }

  if (excludeProfileId) {
    profileIds.delete(excludeProfileId);
  }

  return [...profileIds];
}

type MaintenanceTicketPush = {
  id: string;
  ticketNumber: string;
  issue: string;
  category?: string | null;
  priority?: string | null;
  status?: string | null;
  tenant?: { id?: string; name?: string | null } | null;
  unit?: { unitNumber?: string | null } | null;
  property?: { name?: string | null } | null;
};

/** Notify landlord owner & team when a tenant logs a maintenance ticket. */
export async function sendMaintenanceTicketPush(
  ticket: MaintenanceTicketPush,
  workspaceId: number
) {
  const recipientProfileIds = await resolveWorkspaceOwnerAndTeamProfileIds(workspaceId);

  if (recipientProfileIds.length === 0) {
    return { sent: 0, failed: 0, recipients: 0 };
  }

  const tenantName = ticket.tenant?.name?.trim() || "A resident";
  const unitLabel = ticket.unit?.unitNumber
    ? `Unit ${ticket.unit.unitNumber}`
    : ticket.property?.name || "Property";

  const priorityPrefix =
    ticket.priority === "Emergency"
      ? "🚨 Emergency: "
      : ticket.priority === "High"
        ? "High priority: "
        : "";

  const title = `${priorityPrefix}New repair ticket ${ticket.ticketNumber}`;
  const body = truncatePushBody(`${tenantName} · ${unitLabel}: ${ticket.issue}`);

  const result = await sendPushToProfiles(recipientProfileIds, {
    title,
    body,
    data: {
      screen: "maintenance",
      role: "OWNER",
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      category: ticket.category || "General Repair",
    },
  });

  return {
    sent: result.sent,
    failed: result.failed,
    recipients: recipientProfileIds.length,
  };
}

/** Notify tenant or landlord when a repair ticket status changes. */
export async function sendMaintenanceStatusUpdatePush(
  ticket: MaintenanceTicketPush,
  workspaceId: number,
  recipient: "TENANT" | "OWNER",
  excludeProfileId?: string | null
) {
  const statusLabel = ticket.status || "Updated";
  const unitLabel = ticket.unit?.unitNumber
    ? `Unit ${ticket.unit.unitNumber}`
    : ticket.property?.name || "Property";

  if (recipient === "TENANT" && ticket.tenant) {
    const tenantId = ticket.tenant.id ? String(ticket.tenant.id) : null;
    const profileId = tenantId ? await resolveTenantProfileId(tenantId) : null;
    if (!profileId) return { sent: 0, failed: 0, recipients: 0 };

    const title = `Repair ticket ${ticket.ticketNumber} updated`;
    const body = truncatePushBody(`${unitLabel}: status is now "${statusLabel}"`);

    const result = await sendPushToProfile(profileId, {
      title,
      body,
      data: {
        screen: "maintenance",
        role: "TENANT",
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: statusLabel,
        type: "maintenance_update",
      },
    });
    return { sent: result.sent, failed: result.failed, recipients: 1 };
  }

  const recipientProfileIds = await resolveWorkspaceOwnerAndTeamProfileIds(
    workspaceId,
    excludeProfileId
  );
  if (recipientProfileIds.length === 0) {
    return { sent: 0, failed: 0, recipients: 0 };
  }

  const tenantName = ticket.tenant?.name?.trim() || "A resident";
  const title = `Repair ticket ${ticket.ticketNumber} updated`;
  const body = truncatePushBody(
    `${tenantName} · ${unitLabel}: status is now "${statusLabel}"`
  );

  const result = await sendPushToProfiles(recipientProfileIds, {
    title,
    body,
    data: {
      screen: "maintenance",
      role: "OWNER",
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      status: statusLabel,
      type: "maintenance_update",
    },
  });

  return {
    sent: result.sent,
    failed: result.failed,
    recipients: recipientProfileIds.length,
  };
}

type RentBillPush = {
  id: string;
  invoiceNumber: string;
  amount: number;
  paymentMethod?: string | null;
  tenant?: { id?: string; name?: string | null; email?: string | null } | null;
  unit?: { unitNumber?: string | null } | null;
  property?: { name?: string | null } | null;
};

async function tenantProfileFromBill(bill: RentBillPush): Promise<string | null> {
  if (!bill.tenant) return null;
  if (bill.tenant.id) return resolveTenantProfileId(bill.tenant.id);
  if (bill.tenant.email) return profileIdForEmail(bill.tenant.email);
  return null;
}

/** Notify landlord when tenant submits rent for manual verification (UPI/GPay etc.). */
export async function sendRentPaymentSubmittedForVerificationPush(
  bill: RentBillPush,
  workspaceId: number
) {
  const recipientProfileIds = await resolveWorkspaceOwnerAndTeamProfileIds(workspaceId);

  if (recipientProfileIds.length === 0) {
    return { sent: 0, failed: 0, recipients: 0 };
  }

  const tenantName = bill.tenant?.name?.trim() || "A tenant";
  const unitLabel = bill.unit?.unitNumber
    ? `Unit ${bill.unit.unitNumber}`
    : bill.property?.name || "Property";
  const amountLabel = formatRentPushAmount(bill.amount);

  const title = "Rent submitted for verification";
  const body = truncatePushBody(
    `${tenantName} · ${unitLabel}: ${amountLabel} — review payment`
  );

  const result = await sendPushToProfiles(recipientProfileIds, {
    title,
    body,
    data: {
      screen: "payments",
      role: "OWNER",
      billId: bill.id,
      invoiceNumber: bill.invoiceNumber,
      type: "rent_verification",
    },
  });

  return {
    sent: result.sent,
    failed: result.failed,
    recipients: recipientProfileIds.length,
  };
}

/** Notify landlord when tenant rent is confirmed via Stripe, Razorpay, etc. */
export async function sendRentPaymentReceivedPush(
  bill: RentBillPush,
  workspaceId: number
) {
  const recipientProfileIds = await resolveWorkspaceOwnerAndTeamProfileIds(workspaceId);

  if (recipientProfileIds.length === 0) {
    return { sent: 0, failed: 0, recipients: 0 };
  }

  const tenantName = bill.tenant?.name?.trim() || "A tenant";
  const unitLabel = bill.unit?.unitNumber
    ? `Unit ${bill.unit.unitNumber}`
    : bill.property?.name || "Property";
  const amountLabel = formatRentPushAmount(bill.amount);
  const gateway = gatewayLabel(bill.paymentMethod) || "Online";

  const title = `Rent received via ${gateway}`;
  const body = truncatePushBody(`${tenantName} · ${unitLabel}: ${amountLabel} confirmed`);

  const result = await sendPushToProfiles(recipientProfileIds, {
    title,
    body,
    data: {
      screen: "payments",
      role: "OWNER",
      billId: bill.id,
      invoiceNumber: bill.invoiceNumber,
      type: "rent_received",
      gateway: gateway.toLowerCase(),
    },
  });

  return {
    sent: result.sent,
    failed: result.failed,
    recipients: recipientProfileIds.length,
  };
}

/** Notify tenant when landlord verifies manual rent payment. */
export async function sendRentPaymentVerifiedPush(
  bill: RentBillPush,
  options?: { receiptReady?: boolean }
) {
  const profileId = await tenantProfileFromBill(bill);
  if (!profileId) return { sent: 0, failed: 0, recipients: 0 };

  const amountLabel = formatRentPushAmount(bill.amount);
  const title = options?.receiptReady
    ? "Rent confirmed — receipt ready"
    : "Rent payment confirmed";
  const body = truncatePushBody(
    options?.receiptReady
      ? `Your payment of ${amountLabel} was verified. Download your receipt in Pay Rent.`
      : `Your landlord verified your rent payment of ${amountLabel}.`
  );

  const result = await sendPushToProfile(profileId, {
    title,
    body,
    data: {
      screen: "payments",
      role: "TENANT",
      billId: bill.id,
      invoiceNumber: bill.invoiceNumber,
      type: options?.receiptReady ? "rent_receipt_ready" : "rent_verified",
    },
  });

  return { sent: result.sent, failed: result.failed, recipients: 1 };
}

/** Notify tenant when a rent receipt is issued or uploaded. */
export async function sendRentReceiptReadyPush(
  bill: RentBillPush,
  tenantId?: string | null
) {
  const resolvedTenantId = tenantId || bill.tenant?.id || null;
  if (!resolvedTenantId) return { sent: 0, failed: 0, recipients: 0 };

  const profileId = await resolveTenantProfileId(resolvedTenantId);
  if (!profileId) return { sent: 0, failed: 0, recipients: 0 };

  const amountLabel = formatRentPushAmount(bill.amount);
  const title = "Your rent receipt is ready";
  const body = truncatePushBody(
    `Receipt for ${amountLabel} is available. Open Pay Rent to download.`
  );

  const result = await sendPushToProfile(profileId, {
    title,
    body,
    data: {
      screen: "payments",
      role: "TENANT",
      billId: bill.id,
      invoiceNumber: bill.invoiceNumber,
      type: "rent_receipt_ready",
    },
  });

  return { sent: result.sent, failed: result.failed, recipients: 1 };
}

/** Notify chat recipient(s) for a new message. */
export async function sendNewChatMessagePush(params: {
  roomId: string;
  senderProfileId?: string | null;
  senderName?: string;
  text: string;
  workspaceId?: number | null;
}) {
  const room = await prisma.chatRoom.findUnique({
    where: { id: params.roomId },
    select: { tenantId: true, workspaceId: true, name: true },
  });
  if (!room) return { sent: 0, failed: 0, recipients: 0 };

  const workspaceId = params.workspaceId ?? room.workspaceId;
  const senderId = params.senderProfileId?.trim() || null;

  let senderRole: string | null = null;
  if (senderId) {
    const sender = await prisma.profile.findUnique({
      where: { id: senderId },
      select: { role: true },
    });
    senderRole = sender?.role ?? null;
  }

  const isTenantSender = senderRole === "TENANT";
  const preview = truncatePushBody(params.text, 120);
  const senderLabel = params.senderName?.trim() || "Someone";

  if (isTenantSender && workspaceId) {
    const recipientProfileIds = await resolveWorkspaceOwnerAndTeamProfileIds(
      workspaceId,
      senderId
    );
    if (recipientProfileIds.length === 0) {
      return { sent: 0, failed: 0, recipients: 0 };
    }

    const result = await sendPushToProfiles(recipientProfileIds, {
      title: `New message from ${senderLabel}`,
      body: preview,
      data: {
        screen: "messages",
        role: "OWNER",
        roomId: params.roomId,
        type: "chat_message",
      },
    });
    return {
      sent: result.sent,
      failed: result.failed,
      recipients: recipientProfileIds.length,
    };
  }

  if (room.tenantId) {
    const profileId = await resolveTenantProfileId(room.tenantId);
    if (!profileId || profileId === senderId) {
      return { sent: 0, failed: 0, recipients: 0 };
    }

    const result = await sendPushToProfile(profileId, {
      title: `New message from ${senderLabel}`,
      body: preview,
      data: {
        screen: "messages",
        role: "TENANT",
        roomId: params.roomId,
        type: "chat_message",
      },
    });
    return { sent: result.sent, failed: result.failed, recipients: 1 };
  }

  return { sent: 0, failed: 0, recipients: 0 };
}

type SupportTicketPush = {
  id: string;
  ticketNumber: string;
  subject: string;
  category?: string | null;
  priority?: string | null;
  status?: string | null;
  message?: string | null;
  contactEmail?: string | null;
};

/** Notify landlord when tenant opens a support ticket. */
export async function sendTenantSupportTicketPush(
  ticket: SupportTicketPush,
  workspaceId: number
) {
  const recipientProfileIds = await resolveWorkspaceOwnerAndTeamProfileIds(workspaceId);
  if (recipientProfileIds.length === 0) {
    return { sent: 0, failed: 0, recipients: 0 };
  }

  const priorityPrefix =
    ticket.priority === "High" || ticket.priority === "Urgent"
      ? "High priority: "
      : "";

  const title = `${priorityPrefix}Tenant support ticket ${ticket.ticketNumber}`;
  const body = truncatePushBody(`${ticket.subject}: ${ticket.message || ""}`);

  const result = await sendPushToProfiles(recipientProfileIds, {
    title,
    body,
    data: {
      screen: "support",
      role: "OWNER",
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      type: "support_ticket",
    },
  });

  return {
    sent: result.sent,
    failed: result.failed,
    recipients: recipientProfileIds.length,
  };
}

/** Notify tenant when landlord updates their support ticket. */
export async function sendSupportTicketUpdateToTenantPush(
  ticket: SupportTicketPush,
  tenantProfileId?: string | null
) {
  let profileId = tenantProfileId;
  if (!profileId && ticket.contactEmail) {
    profileId = await profileIdForEmail(ticket.contactEmail);
  }
  if (!profileId) return { sent: 0, failed: 0, recipients: 0 };

  const statusLabel = ticket.status || "Updated";
  const title = `Support ticket ${ticket.ticketNumber} updated`;
  const body = truncatePushBody(`${ticket.subject}: status is now "${statusLabel}"`);

  const result = await sendPushToProfile(profileId, {
    title,
    body,
    data: {
      screen: "support",
      role: "TENANT",
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      status: statusLabel,
      type: "support_update",
    },
  });

  return { sent: result.sent, failed: result.failed, recipients: 1 };
}

type ListingInquiryPush = {
  id: string;
  tenantName: string;
  phone?: string | null;
  email?: string | null;
  moveInDate?: string | null;
  listingTitle?: string | null;
};

/** Notify landlord of a new marketplace listing inquiry. */
export async function sendListingInquiryPush(
  inquiry: ListingInquiryPush,
  workspaceId: number
) {
  const recipientProfileIds = await resolveWorkspaceOwnerAndTeamProfileIds(workspaceId);
  if (recipientProfileIds.length === 0) {
    return { sent: 0, failed: 0, recipients: 0 };
  }

  const listingLabel = inquiry.listingTitle?.trim() || "your listing";
  const title = "New listing inquiry";
  const body = truncatePushBody(
    `${inquiry.tenantName} is interested in ${listingLabel}`
  );

  const result = await sendPushToProfiles(recipientProfileIds, {
    title,
    body,
    data: {
      screen: "inquiries",
      role: "OWNER",
      inquiryId: inquiry.id,
      type: "listing_inquiry",
    },
  });

  return {
    sent: result.sent,
    failed: result.failed,
    recipients: recipientProfileIds.length,
  };
}

type NewTenantPush = {
  id: string;
  name: string;
  email?: string | null;
  profileId?: string | null;
  unit?: { unitNumber?: string | null } | null;
  property?: { name?: string | null } | null;
};

/** Welcome push when a tenant is onboarded. */
export async function sendNewTenantWelcomePush(tenant: NewTenantPush) {
  const profileId =
    tenant.profileId ||
    (tenant.id ? await resolveTenantProfileId(tenant.id) : null) ||
    (tenant.email ? await profileIdForEmail(tenant.email) : null);

  if (!profileId) return { sent: 0, failed: 0, recipients: 0 };

  const propertyLabel = tenant.property?.name || "your new home";
  const unitLabel = tenant.unit?.unitNumber
    ? `Unit ${tenant.unit.unitNumber}`
    : propertyLabel;

  const result = await sendPushToProfile(profileId, {
    title: "Welcome to RentAwas",
    body: truncatePushBody(
      `Hi ${tenant.name}, you're set up at ${unitLabel}. Open the app to pay rent and manage your tenancy.`
    ),
    data: {
      screen: "home",
      role: "TENANT",
      tenantId: tenant.id,
      type: "tenant_welcome",
    },
  });

  return { sent: result.sent, failed: result.failed, recipients: 1 };
}

/** Notify landlord/team that a new tenant was added. */
export async function sendNewTenantNotifyOwnerPush(
  tenant: NewTenantPush,
  workspaceId: number,
  excludeProfileId?: string | null
) {
  const recipientProfileIds = await resolveWorkspaceOwnerAndTeamProfileIds(
    workspaceId,
    excludeProfileId
  );
  if (recipientProfileIds.length === 0) {
    return { sent: 0, failed: 0, recipients: 0 };
  }

  const unitLabel = tenant.unit?.unitNumber
    ? `Unit ${tenant.unit.unitNumber}`
    : tenant.property?.name || "Property";

  const result = await sendPushToProfiles(recipientProfileIds, {
    title: "New tenant added",
    body: truncatePushBody(`${tenant.name} assigned to ${unitLabel}`),
    data: {
      screen: "tenants",
      role: "OWNER",
      tenantId: tenant.id,
      type: "new_tenant",
    },
  });

  return {
    sent: result.sent,
    failed: result.failed,
    recipients: recipientProfileIds.length,
  };
}

type DocumentUploadPush = {
  id: string;
  title: string;
  docType?: string | null;
  tenant?: { id?: string; name?: string | null } | null;
};

/** Notify landlord when tenant uploads a document. */
export async function sendTenantDocumentUploadedPush(
  doc: DocumentUploadPush,
  workspaceId: number
) {
  const recipientProfileIds = await resolveWorkspaceOwnerAndTeamProfileIds(workspaceId);
  if (recipientProfileIds.length === 0) {
    return { sent: 0, failed: 0, recipients: 0 };
  }

  const tenantName = doc.tenant?.name?.trim() || "A tenant";
  const docLabel = doc.docType?.trim() || doc.title;

  const result = await sendPushToProfiles(recipientProfileIds, {
    title: "New document uploaded",
    body: truncatePushBody(`${tenantName} uploaded ${docLabel}`),
    data: {
      screen: "documents",
      role: "OWNER",
      documentId: doc.id,
      type: "document_upload",
    },
  });

  return {
    sent: result.sent,
    failed: result.failed,
    recipients: recipientProfileIds.length,
  };
}
