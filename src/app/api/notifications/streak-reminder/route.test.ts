import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { db } from "@/db";
import { getMessaging } from "@/lib/notifications/firebase-admin";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("drizzle-orm", () => ({
  and: vi.fn(),
  eq: vi.fn(),
  isNotNull: vi.fn(),
}));

vi.mock("@/db/schema", () => ({
  pushSubscriptions: {
    id: "id",
    token: "token",
    timezone: "timezone",
    lastNotificationSent: "lastNotificationSent",
    userId: "userId",
    active: "active",
  },
  userStreakState: "userStreakState",
  users: { settings: "settings", id: "id" },
}));

vi.mock("@/lib/notifications/firebase-admin", () => ({
  getMessaging: vi.fn(),
}));

describe("POST /api/notifications/streak-reminder", () => {
  const send = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";
    vi.mocked(getMessaging).mockResolvedValue({ send } as never);
    vi.mocked(send).mockResolvedValue("message-id");

    const subscriptions = [
      {
        id: "sub-1",
        token: "token-1",
        timezone: "Asia/Jakarta",
        lastNotificationSent: null,
        userId: "user-1",
        streak: { currentDays: 7, lastStreakDate: "2000-01-01" },
        settings: { locale: "en", streakReminderEnabled: true },
      },
    ];
    const where = vi.fn().mockResolvedValue(subscriptions);
    const secondJoin = vi.fn().mockReturnValue({ where });
    const firstJoin = vi.fn().mockReturnValue({ innerJoin: secondJoin });
    const from = vi.fn().mockReturnValue({ innerJoin: firstJoin });
    vi.mocked(db.select).mockReturnValue({ from } as never);
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    } as never);
  });

  it("sends the active user's English copy", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const response = await POST(new Request("http://localhost/api/notifications/streak-reminder", {
      method: "POST",
      headers: { authorization: "Bearer test-secret" },
    }));

    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledOnce();
    const message = send.mock.calls[0][0];
    expect(message.notification).toEqual({
      title: "Your streak is still glowing 🔥",
      body: "One meaningful activity keeps your 7-day streak going.",
    });
    expect(message.webpush.notification).toEqual(expect.objectContaining(message.notification));
    vi.restoreAllMocks();
  });
});
