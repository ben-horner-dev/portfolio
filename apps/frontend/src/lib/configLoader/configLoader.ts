import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export type ConfigLoadErrorHandler = (
  error: unknown,
  context: { configPath: string },
) => never;

export function configLoader(
  configPath: string,
  onError: ConfigLoadErrorHandler,
): unknown {
  try {
    const absolutePath = resolve(process.cwd(), configPath);
    const configFile = readFileSync(absolutePath, "utf8");
    const config: unknown = JSON.parse(configFile);
    return config;
  } catch (error) {
    return onError(error, { configPath });
  }
}
