import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    select: vi.fn(),
    loggerError: vi.fn(),
}));

vi.mock("@/db", () => ({
    db: { select: mocks.select },
}));

vi.mock("@/db/schema", () => ({
    users: {
        id: "users.id",
        name: "users.name",
        isMuhsinin: "users.isMuhsinin",
        gender: "users.gender",
        image: "users.image",
        settings: "users.settings",
    },
    accounts: {},
    sessions: {},
    verificationTokens: {},
}));

vi.mock("drizzle-orm", () => ({ eq: vi.fn() }));
vi.mock("@auth/drizzle-adapter", () => ({ DrizzleAdapter: vi.fn(() => ({})) }));
vi.mock("@/lib/logger", () => ({ logger: { error: mocks.loggerError } }));
vi.mock("next-auth", () => ({
    default: (options: unknown) => ({ auth: vi.fn(), handlers: {}, options }),
}));
vi.mock("next-auth/providers/google", () => ({ default: vi.fn(() => ({})) }));

import { authOptions, isUserValid } from "./auth";

function mockUserLookup(result: unknown) {
    const limit = vi.fn().mockResolvedValue(result);
    const where = vi.fn(() => ({ limit }));
    const from = vi.fn(() => ({ where }));
    mocks.select.mockReturnValue({ from });
}

describe("authentication user validation", () => {
    beforeEach(() => {
        mocks.select.mockReset();
        mocks.loggerError.mockReset();
    });

    it("accepts an existing user", async () => {
        mockUserLookup([{ id: "user-1" }]);

        await expect(isUserValid("user-1")).resolves.toBe(true);
    });

    it("rejects when the user does not exist", async () => {
        mockUserLookup([]);

        await expect(isUserValid("unknown-user")).resolves.toBe(false);
    });

    it("rejects when the database lookup fails", async () => {
        const where = vi.fn(() => ({
            limit: vi.fn().mockRejectedValue(new Error("database unavailable")),
        }));
        mocks.select.mockReturnValue({ from: vi.fn(() => ({ where })) });

        await expect(isUserValid("user-1")).resolves.toBe(false);
        expect(mocks.loggerError).toHaveBeenCalledWith(
            "Failed to validate user in DB; rejecting session",
            expect.any(Error),
            { userId: "user-1" },
        );
    });

    it("accepts a session for an existing user", async () => {
        mockUserLookup([{ id: "user-1" }]);

        const sessionCallback = authOptions.callbacks?.session;
        const session = { user: {} };
        const token = { id: "user-1", isMuhsinin: true, gender: "male", picture: "avatar" };

        await expect(sessionCallback!({ session, token } as never)).resolves.toEqual({
            user: { id: "user-1", isMuhsinin: true, gender: "male", image: "avatar" },
        });
    });

    it("rejects a session for an unknown user", async () => {
        mockUserLookup([]);

        const sessionCallback = authOptions.callbacks?.session;
        const session = { user: {} };
        const token = { id: "unknown-user" };

        await expect(sessionCallback!({ session, token } as never)).resolves.toBeNull();
    });

    it("rejects the session when validation throws unexpectedly", async () => {
        const sessionCallback = authOptions.callbacks?.session;
        expect(sessionCallback).toBeTypeOf("function");

        const session = { user: { id: "user-1" } };
        const token = { id: "user-1" };
        mocks.select.mockImplementation(() => {
            throw new Error("unexpected database failure");
        });

        await expect(sessionCallback!({ session, token } as never)).resolves.toBeNull();
    });
});
