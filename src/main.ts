import { promises as fs } from "fs";
import * as os from "os";
import * as path from "path";

import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as io from "@actions/io";

import * as installer from "./installer";
import * as flags from "./flags";
import * as setupGo from "./setup-go/main";
import * as cache from "./cache";

async function run() {
  const runnerTmpdir = process.env["RUNNER_TEMP"] || os.tmpdir();
  const tmpdir = await fs.mkdtemp(path.join(runnerTmpdir, "reviewdog-"));

  try {
    const reviewdogVersion = core.getInput("reviewdog_version") || "latest";
    const golangciLintVersion = core.getInput("golangci_lint_version") || "latest";
    const goVersion = core.getInput("go_version");
    const golangciLintFlags = core.getInput("golangci_lint_flags");
    const toolName = core.getInput("tool_name") || "golangci";
    const level = core.getInput("level") || "error";
    const reporter = core.getInput("reporter") || "github-pr-check";
    const filterMode = core.getInput("filter_mode") || "added";
    const failOnError = core.getInput("fail_on_error") || "false";
    const reviewdogFlags = core.getInput("reviewdog_flags");
    const workdir = core.getInput("workdir") || ".";
    const cwd = path.relative(process.env["GITHUB_WORKSPACE"] || process.cwd(), workdir);
    const enableCache = core.getBooleanInput("cache");

    if (goVersion !== "") {
      await core.group("Installing Go ...", async () => {
        await setupGo.run(goVersion);
      });
    }

    const reviewdog = await core.group(
      "🐶 Installing reviewdog ... https://github.com/reviewdog/reviewdog",
      async () => {
        return await installer.installReviewdog(reviewdogVersion, tmpdir);
      }
    );

    const golangci = await core.group(
      "Installing golangci-lint ... https://github.com/golangci/golangci-lint",
      async () => {
        return await installer.installGolangciLint(golangciLintVersion, tmpdir);
      }
    );

    let cacheState: cache.State | undefined = undefined;
    if (enableCache) {
      cacheState = await core.group("Restoring cache ...", async () => {
        return await cache.restore(cwd);
      });
    }

    const code = await core.group("Running golangci-lint with reviewdog 🐶 ...", async (): Promise<number> => {
      const output = await exec.getExecOutput(
        golangci,
        ["run", "--out-format", "line-number", ...flags.parse(golangciLintFlags)],
        {
          cwd,
          ignoreReturnCode: true,
        }
      );

      process.env["REVIEWDOG_GITHUB_API_TOKEN"] = core.getInput("github_token");
      return await exec.exec(
        reviewdog,
        [
          "-f=golangci-lint",
          `-name=${toolName}`,
          `-reporter=${reporter}`,
          `-filter-mode=${filterMode}`,
          `-fail-on-error=${failOnError}`,
          `-level=${level}`,
          ...flags.parse(reviewdogFlags),
        ],
        {
          cwd,
          input: Buffer.from(output.stdout, "utf-8"),
          ignoreReturnCode: true,
        }
      );
    });

    if (cacheState) {
      await core.group("Saving cache ...", async () => {
        if (cacheState) {
          await cache.save(cacheState);
        }
      });
    }

    if (code !== 0) {
      core.setFailed(`reviewdog exited with status code: ${code}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error);
    } else {
      core.setFailed(`${error}`);
    }
  } finally {
    // clean up the temporary directory
    try {
      await io.rmRF(tmpdir);
    } catch (error) {
      // suppress errors
      // Garbage will remain, but it may be harmless.
      if (error instanceof Error) {
        core.info(`clean up failed: ${error.message}`);
      } else {
        core.info(`clean up failed: ${error}`);
      }
    }
  }
}

run();
