import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { type ConfigLoadErrorHandler, configLoader } from "@/lib/configLoader";

describe("ConfigLoader", () => {
  it("should call error handler when file read fails", () => {
    const mockErrorHandler = vi.fn((_: unknown, __: { configPath: string }) => {
      throw new Error("Custom error");
    }) as ConfigLoadErrorHandler;

    expect(() => configLoader("./nonexistent.json", mockErrorHandler)).toThrow(
      "Custom error",
    );

    expect(mockErrorHandler).toHaveBeenCalledWith(expect.any(Error), {
      configPath: "./nonexistent.json",
    });
  });

  it("should call error handler with correct context", () => {
    const mockErrorHandler = vi.fn(
      (error: unknown, context: { configPath: string }) => {
        expect(context.configPath).toBe("./test.json");
        expect(error).toBeInstanceOf(Error);
        throw new Error("Context verified");
      },
    ) as ConfigLoadErrorHandler;

    expect(() => configLoader("./test.json", mockErrorHandler)).toThrow(
      "Context verified",
    );

    expect(mockErrorHandler).toHaveBeenCalledWith(expect.any(Error), {
      configPath: "./test.json",
    });
  });

  it("should allow custom error transformation in error handler", () => {
    const customErrorHandler: ConfigLoadErrorHandler = (
      error: unknown,
      _: { configPath: string },
    ) => {
      if (error instanceof Error) {
        throw new Error(`Custom error message: ${error.message}`);
      }
      throw new Error("Unknown error occurred");
    };

    expect(() => configLoader("./invalid.json", customErrorHandler)).toThrow(
      /Custom error message:/,
    );
  });

  it("should load config from absolute path", () => {
    const pathsToTry = [
      resolve(process.cwd(), "apps/frontend/src/config/contentConfig.json"),
      resolve(process.cwd(), "src/config/contentConfig.json"),
    ];
    const absolutePath = pathsToTry.find((p) => existsSync(p));

    if (!absolutePath) {
      throw new Error("contentConfig.json not found for testing");
    }

    const mockErrorHandler = vi.fn(() => {
      throw new Error("Should not be called");
    }) as ConfigLoadErrorHandler;

    const result = configLoader(absolutePath, mockErrorHandler);

    expect(result).toBeDefined();
    expect(typeof result).toBe("object");
    expect(mockErrorHandler).not.toHaveBeenCalled();
  });

  it("should load config from relative path in cwd", () => {
    const srcPath = resolve(process.cwd(), "src/config/contentConfig.json");

    if (!existsSync(srcPath)) {
      return;
    }

    const mockErrorHandler = vi.fn(() => {
      throw new Error("Should not be called");
    }) as ConfigLoadErrorHandler;

    const result = configLoader(
      "src/config/contentConfig.json",
      mockErrorHandler,
    );

    expect(result).toBeDefined();
    expect(typeof result).toBe("object");
    expect(mockErrorHandler).not.toHaveBeenCalled();
  });

  it("should load config from path with src/ prefix", () => {
    const srcPath = resolve(process.cwd(), "src/config/contentConfig.json");

    if (!existsSync(srcPath)) {
      return;
    }

    const mockErrorHandler = vi.fn(() => {
      throw new Error("Should not be called");
    }) as ConfigLoadErrorHandler;

    const result = configLoader(
      "src/config/contentConfig.json",
      mockErrorHandler,
    );

    expect(result).toBeDefined();
    expect(typeof result).toBe("object");
    expect(mockErrorHandler).not.toHaveBeenCalled();
  });

  it("should parse valid JSON config", () => {
    const pathsToTry = [
      resolve(process.cwd(), "apps/frontend/src/config/contentConfig.json"),
      resolve(process.cwd(), "src/config/contentConfig.json"),
    ];
    const absolutePath = pathsToTry.find((p) => existsSync(p));

    if (!absolutePath) {
      throw new Error("contentConfig.json not found for testing");
    }

    const mockErrorHandler = vi.fn(() => {
      throw new Error("Should not be called");
    }) as ConfigLoadErrorHandler;

    const result = configLoader(absolutePath, mockErrorHandler) as Record<
      string,
      unknown
    >;

    expect(result).toHaveProperty("background");
    expect(result).toHaveProperty("hero");
    expect(result).toHaveProperty("chat");
    expect(mockErrorHandler).not.toHaveBeenCalled();
  });
});
