import { serverEnvSchema } from "@/schemas/env";
import type { ServerEnv } from "@/types/env";

// The app fails when a required variable is missing; nothing here reaches the browser.
export const parseServerEnv = (source: Record<string, string | undefined>): ServerEnv => {
  const result = serverEnvSchema.safeParse(source);
  if (!result.success) {
    const missing = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid or missing environment variables: ${missing}`);
  }
  return result.data;
};

let cached: ServerEnv | undefined;

export const getServerEnv = (): ServerEnv => {
  cached ??= parseServerEnv(process.env);
  return cached;
};
