import { NeogmaError } from "neogma";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("neogma", async () => {
  const actual = await vi.importActual("neogma");
  return {
    ...actual,
    Neogma: vi.fn().mockImplementation(function () {
      return {
        driver: {
          close: vi.fn().mockResolvedValue(undefined),
        },
      };
    }),
  };
});

describe("neogma singleton", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe("getNeogma", () => {
    it("should throw NeogmaError when NEO4J_URI is not set", async () => {
      process.env.NEO4J_URI = "";
      process.env.NEO4J_USER = "neo4j";
      process.env.NEO4J_PASS = "password";

      const { getNeogma } = await import("./neogma");

      expect(() => getNeogma()).toThrow(NeogmaError);
      expect(() => getNeogma()).toThrow(
        "NEO4J_URI, NEO4J_USER, and NEO4J_PASS environment variables must be set"
      );
    });

    it("should throw NeogmaError when NEO4J_USER is not set", async () => {
      process.env.NEO4J_URI = "bolt://localhost:7687";
      process.env.NEO4J_USER = "";
      process.env.NEO4J_PASS = "password";

      const { getNeogma } = await import("./neogma");

      expect(() => getNeogma()).toThrow(NeogmaError);
    });

    it("should throw NeogmaError when NEO4J_PASS is not set", async () => {
      process.env.NEO4J_URI = "bolt://localhost:7687";
      process.env.NEO4J_USER = "neo4j";
      process.env.NEO4J_PASS = "";

      const { getNeogma } = await import("./neogma");

      expect(() => getNeogma()).toThrow(NeogmaError);
    });

    it("should create Neogma instance when all env vars are set", async () => {
      process.env.NEO4J_URI = "bolt://localhost:7687";
      process.env.NEO4J_USER = "neo4j";
      process.env.NEO4J_PASS = "password";

      const { getNeogma } = await import("./neogma");
      const { Neogma } = await import("neogma");

      const instance = getNeogma();

      expect(instance).toBeDefined();
      expect(Neogma).toHaveBeenCalledWith({
        url: "bolt://localhost:7687",
        username: "neo4j",
        password: "password",
      });
    });

    it("should return the same instance on subsequent calls (singleton)", async () => {
      process.env.NEO4J_URI = "bolt://localhost:7687";
      process.env.NEO4J_USER = "neo4j";
      process.env.NEO4J_PASS = "password";

      const { getNeogma } = await import("./neogma");
      const { Neogma } = await import("neogma");

      const instance1 = getNeogma();
      const instance2 = getNeogma();

      expect(instance1).toBe(instance2);
      expect(Neogma).toHaveBeenCalledTimes(1);
    });
  });

  describe("closeNeogma", () => {
    it("should close the driver and reset instance", async () => {
      process.env.NEO4J_URI = "bolt://localhost:7687";
      process.env.NEO4J_USER = "neo4j";
      process.env.NEO4J_PASS = "password";

      const { getNeogma, closeNeogma } = await import("./neogma");
      const { Neogma } = await import("neogma");

      const instance = getNeogma();
      await closeNeogma();

      expect(instance.driver.close).toHaveBeenCalled();

      getNeogma();
      expect(Neogma).toHaveBeenCalledTimes(2);
    });

    it("should do nothing if no instance exists", async () => {
      const { closeNeogma } = await import("./neogma");

      await expect(closeNeogma()).resolves.toBeUndefined();
    });
  });
});
