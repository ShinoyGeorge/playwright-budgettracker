import { Pool } from "pg";
import { requireEnv } from "./env";

const pool = new Pool({ connectionString: requireEnv("DATABASE_URL") });

export async function deleteTestUser(email: string): Promise<void> {
    const userResult = await pool.query(`SELECT id FROM "User" WHERE email = $1`, [email]);
    if (userResult.rows.length === 0) return;

    const userId = userResult.rows[0].id;

    await pool.query(`DELETE FROM "RefreshToken" WHERE "userId" = $1`, [userId]);
    await pool.query(`DELETE FROM "User" WHERE id = $1`, [userId]);
}

export async function deleteTestHousehold(name: string): Promise<void> {
    await pool.query(`DELETE FROM "Household" WHERE name = $1`, [name]);
}

// TODO-confirm-schema: table/column names taken from TRACKER-21's description
// ("stored as a pending `HouseholdCreationRequest`"), not verified against the
// real database schema yet.
export async function deletePendingHouseholdRequest(email: string): Promise<void> {
    await pool.query(`DELETE FROM "HouseholdCreationRequest" WHERE email = $1`, [email]);
}

export async function closeDbConnection(): Promise<void> {
    await pool.end();
}