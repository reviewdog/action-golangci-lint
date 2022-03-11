// this file comes from https://github.com/actions/setup-go/blob/3b4dc6cbed1779f759b9c638cb83696acea809d1/src/main.ts
// see LICENSE for its license

import * as core from "@actions/core";
import * as installer from "./installer";
import * as io from "@actions/io";
import { URL } from "url";
import cp from "child_process";
import fs from "fs";
import path from "path";

export async function run(versionSpec: string): Promise<void> {
  try {
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
