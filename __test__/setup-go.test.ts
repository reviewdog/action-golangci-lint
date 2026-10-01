import { jest } from "@jest/globals";
import * as path from "path";

const goPath = path.join("tools with spaces", "go", "bin", "go");
const execFileSync = jest.fn(() => Buffer.from("go output"));
const execSync = jest.fn(() => {
  throw new Error("Go must not be executed through a shell");
});
const setFailed = jest.fn();

jest.unstable_mockModule("child_process", () => ({ default: { execFileSync, execSync } }));
jest.unstable_mockModule("@actions/core", () => ({
  getInput: jest.fn(() => ""),
  exportVariable: jest.fn(),
  addPath: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  startGroup: jest.fn(),
  endGroup: jest.fn(),
  setFailed,
}));
jest.unstable_mockModule("@actions/io", () => ({
  which: jest.fn(async () => goPath),
  mkdirP: jest.fn(async () => {}),
}));
jest.unstable_mockModule("../src/setup-go/installer.js", () => ({
  getGo: jest.fn(async () => "tools with spaces/go"),
}));
jest.unstable_mockModule("fs", () => ({ default: { existsSync: jest.fn(() => true) } }));

const setupGo = await import("../src/setup-go/main.js");

it("executes the resolved Go binary without shell parsing, including paths with spaces", async () => {
  await setupGo.run("1.x", "");

  expect(execFileSync.mock.calls).toEqual([
    [goPath, ["env", "GOPATH"]],
    [goPath, ["version"]],
    [goPath, ["env"]],
  ]);
  expect(execSync).not.toHaveBeenCalled();
  expect(setFailed).not.toHaveBeenCalled();
});
