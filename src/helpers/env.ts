import dotenv from "dotenv";
import path from "path";

const env = process.env.TEST_ENV ?? "local";
const envFile = `.env.${env}`;

dotenv.config({ path: path.resolve(__dirname, "..", envFile) });

export function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key} (loaded from ${envFile})`);
    }
    return value;
}