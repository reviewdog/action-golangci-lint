// this file comes from https://github.com/actions/setup-go/blob/b22fbbc2921299758641fab08929b4ac52b32923/src/main.ts
// see LICENSE for its license

import * as core from "@actions/core";
import * as installer from "./installer";
import * as io from "@actions/io";
import { URL } from "url";
import cp from "child_process";
import fs from "fs";
import path from "path";

const defaultGoVersion = "1.x";

export async function run(version: string, versionFilePath: string): Promise<void> {
  try {
    const versionSpec = resolveVersionInput(version, versionFilePath);
    if (versionSpec === "") {
      return;
    }

    core.info(`Setup go version spec ${versionSpec}`);

    if (versionSpec) {
      const token = core.getInput("token");
      const auth = !token || isGhes() ? undefined : `token ${token}`;

      const checkLatest = false;
      const installDir = await installer.getGo(versionSpec, checkLatest, auth);

      core.exportVariable("GOROOT", installDir);
      core.addPath(path.join(installDir, "bin"));
      core.info("Added go to the path");

      const added = await addBinToPath();
      core.debug(`add bin ${added}`);
      core.info(`Successfully setup go version ${versionSpec}`);
    }

    // output the version actually being used
    const goPath = await io.which("go");
    const goVersion = (cp.execSync(`${goPath} version`) || "").toString();
    core.info(goVersion);

    core.startGroup("go env");
    const goEnv = (cp.execSync(`${goPath} env`) || "").toString();
    core.info(goEnv);
    core.endGroup();
  } catch (error) {
    core.setFailed(`${error}`);
  }
}

export async function addBinToPath(): Promise<boolean> {
  let added = false;
  const g = await io.which("go");
  core.debug(`which go :${g}:`);
  if (!g) {
    core.debug("go not in the path");
    return added;
  }

  const buf = cp.execSync("go env GOPATH");
  if (buf) {
    const gp = buf.toString().trim();
    core.debug(`go env GOPATH :${gp}:`);
    if (!fs.existsSync(gp)) {
      // some of the hosted images have go install but not profile dir
      core.debug(`creating ${gp}`);
      await io.mkdirP(gp);
    }

    const bp = path.join(gp, "bin");
    if (!fs.existsSync(bp)) {
      core.debug(`creating ${bp}`);
      await io.mkdirP(bp);
    }

    core.addPath(bp);
    added = true;
  }
  return added;
}

function isGhes(): boolean {
  const ghUrl = new URL(process.env["GITHUB_SERVER_URL"] || "https://github.com");
  return ghUrl.hostname.toUpperCase() !== "GITHUB.COM";
}

function resolveVersionInput(version: string, versionFilePath: string): string {
  if (version && versionFilePath) {
    core.warning("Both go_version and go_version_file inputs are specified, only go_version will be used");
  }

  if (version) {
    return version;
  }

  if (versionFilePath) {
    if (!fs.existsSync(versionFilePath)) {
      throw new Error(`The specified go version file at: ${versionFilePath} does not exist`);
    }
    version = installer.parseGoVersionFile(versionFilePath);
  }

  if (!version) {
    version = defaultGoVersion;
  }

  return version;
}
