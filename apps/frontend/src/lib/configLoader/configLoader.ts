import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";

export type ConfigLoadErrorHandler = (
  error: unknown,
  context: { configPath: string },
) => never;

export function configLoader(
  configPath: string,
  onError: ConfigLoadErrorHandler,
): unknown {
  try {
    let absolutePath: string;

    if (isAbsolute(configPath)) {
      absolutePath = configPath;
    } else {
      const cwd = process.cwd();
      const pathsToTry = [
        resolve(cwd, configPath),
        resolve(cwd, "apps/frontend", configPath),
        resolve(cwd, "src", configPath.replace(/^src\//, "")),
      ];

      absolutePath =
        pathsToTry.find((path) => existsSync(path)) || pathsToTry[0];
    }

    const configFile = readFileSync(absolutePath, "utf8");
    const config: unknown = JSON.parse(configFile);
    return config;
  } catch (error) {
    return onError(error, { configPath });
  }
}
