import { promises as fs } from "fs";
import * as path from "path";

const tempDir = path.join(__dirname, "_temp");
process.env["RUNNER_TEMP"] = tempDir;

import * as io from "@actions/io";
import * as exec from "@actions/exec";
import * as installer from "../src/installer";

describe("installer", () => {
  beforeAll(async () => {
    await io.mkdirP(tempDir);
  });

  afterAll(async () => {
    await io.rmRF(tempDir);
  });

  it(
    "installs specific version of reviewdog",
    async () => {
      const dir = await fs.mkdtemp(path.join(tempDir, "reviewdog-"));
      const reviewdog = await installer.installReviewdog("v0.12.0", dir);
      await exec.exec(reviewdog, ["--version"]);
    },
    5 * 60 * 1000
  );

  it(
    "installs the latest version of reviewdog",
    async () => {
      const dir = await fs.mkdtemp(path.join(tempDir, "reviewdog-"));
      const reviewdog = await installer.installReviewdog("latest", dir);
      await exec.exec(reviewdog, ["--version"]);
    },
    5 * 60 * 1000
  );

  it(
    "installs specific version of golangci-lint",
    async () => {
      const dir = await fs.mkdtemp(path.join(tempDir, "golangci-"));
      const golangci = await installer.installGolangciLint("v1.41.1", dir);
      await exec.exec(golangci, ["--version"]);
    },
    5 * 60 * 1000
  );

  it(
    "installs the latest version of golangci-lint",
    async () => {
      const dir = await fs.mkdtemp(path.join(tempDir, "golangci-"));
      const golangci = await installer.installGolangciLint("latest", dir);
      await exec.exec(golangci, ["--version"]);
    },
    5 * 60 * 1000
  );
});
