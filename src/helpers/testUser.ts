import { requireEnv } from "./env";

export type testData = { [key: string]: TestUser };
export type Role = "ADMIN" | "MEMBER";

export interface TestUser {
    email: string;
    password: string;
    role: Role;
    name?: string;
    householdName?: string;
}

export const TestData: testData = {
    admin: {
        email: requireEnv("E2E_ADMIN_EMAIL"),
        password: requireEnv("E2E_ADMIN_PASSWORD"),
        role: "ADMIN",
    },

    householdAUser1: {
        email: requireEnv("E2E_HOUSEHOLD_A_USER1_EMAIL"),
        password: requireEnv("E2E_HOUSEHOLD_A_USER1_PASSWORD"),
        role: "MEMBER",
        name: "E2E User A1",
        householdName: "E2E Household A",
    },

    householdAUser2: {
        email: requireEnv("E2E_HOUSEHOLD_A_USER2_EMAIL"),
        password: requireEnv("E2E_HOUSEHOLD_A_USER2_PASSWORD"),
        role: "MEMBER",
        name: "E2E User A2",
        householdName: "E2E Household A",
    },

    householdBUser1: {
        email: requireEnv("E2E_HOUSEHOLD_B_USER1_EMAIL"),
        password: requireEnv("E2E_HOUSEHOLD_B_USER1_PASSWORD"),
        role: "MEMBER",
        name: "E2E User B1",
        householdName: "E2E Household B",
    },
};