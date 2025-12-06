import { Neogma, NeogmaError } from "neogma";

const NEO4J_URI = process.env.NEO4J_URI;
const NEO4J_USER = process.env.NEO4J_USER;
const NEO4J_PASS = process.env.NEO4J_PASS;

let neogmaInstance: Neogma | null = null;

export const getNeogma = (): Neogma => {
  if (neogmaInstance) {
    return neogmaInstance;
  }

  if (!NEO4J_URI || !NEO4J_USER || !NEO4J_PASS) {
    throw new NeogmaError(
      "NEO4J_URI, NEO4J_USER, and NEO4J_PASS environment variables must be set",
    );
  }

  neogmaInstance = new Neogma({
    url: NEO4J_URI,
    username: NEO4J_USER,
    password: NEO4J_PASS,
  });

  return neogmaInstance;
};

export const closeNeogma = async (): Promise<void> => {
  if (neogmaInstance) {
    await neogmaInstance.driver.close();
    neogmaInstance = null;
  }
};
