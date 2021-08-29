import * as crypto from 'crypto';
import * as fs from 'fs';
import * as stream from 'stream';
import * as util from 'util';
import * as path from 'path';
import * as core from '@actions/core';
import * as cache from '@actions/cache';

const paths = ['~/.cache/golangci-lint', '~/.cache/go-build', '~/go/pkg'];

export interface State {
  key: string;
  cachedKey: string | undefined;
}

export async function restore(cwd: string): Promise<State> {
  const keyPrefix = `${process.platform}-golangci-`;
  const hash = await hashFiles(path.join(cwd, 'go.sum'));
  const key = keyPrefix + hash;
  const restoreKeys = [keyPrefix];

  let cachedKey: string | undefined = undefined;
  try {
    cachedKey = await cache.restoreCache(paths, key, restoreKeys);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name !== cache.ValidationError.name) {
        core.info(`[warning] There was an error restoring the cache ${error.message}`);
      }
    } else {
      core.info(`[warning] There was an error restoring the cache ${error}`);
    }
  }

  if (cachedKey) {
    core.info(`Found cache for key: ${cachedKey}`);
  } else {
    core.info(`cache not found for input keys: ${key}, ${restoreKeys.join(', ')}`);
  }
  return {key, cachedKey};
}

export async function save(state: State): Promise<void> {
  const {cachedKey, key} = state;
  if (cachedKey === key) {
    core.info(`cache for ${key} already exists, skip saving.`);
    return;
  }
  core.info(`saving cache for ${key}.`);
  try {
    await cache.saveCache(paths, key);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === cache.ValidationError.name) {
        throw error;
      } else if (error.name === cache.ReserveCacheError.name) {
        core.info(error.message);
      } else {
        core.info(`[warning]${error.message}`);
      }
    } else {
      core.info(`[warning]${error}`);
    }
  }
}

// see https://github.com/actions/runner/blob/master/src/Misc/expressionFunc/hashFiles/src/hashFiles.ts
async function hashFiles(...files: string[]): Promise<string> {
  const result = crypto.createHash('sha256');
  for (const file of files) {
    try {
      const hash = crypto.createHash('sha256');
      const pipeline = util.promisify(stream.pipeline);
      await pipeline(fs.createReadStream(file), hash);
      result.write(hash.digest());
    } catch (err) {
      // skip files that doesn't exist.
      if ((err as any).code !== 'ENOENT') {
        throw err;
      }
    }
  }
  result.end();
  return result.digest('hex');
}
