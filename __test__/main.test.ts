import { isGolangciLintV1 } from "../src/main";

describe("isV1", () => {
  it("should return false if the version is latest", () => {
    expect(isGolangciLintV1("latest")).toBe(false);
  });

  it("should return true if the version is v1.x.x", () => {
    expect(isGolangciLintV1("v1.0.0")).toBe(true);
  });

  it("should return true if the version is v2.x.x", () => {
    expect(isGolangciLintV1("v2.0.0")).toBe(false);
  });
});
