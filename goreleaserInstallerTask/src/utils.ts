'use strict';

import tl = require('azure-pipelines-task-lib/task');
import path = require('path');
import fs = require('fs');
import * as toolLib from 'azure-pipelines-tool-lib/tool';
import * as os from 'os';
import * as util from 'util';
import axios, {Method} from 'axios';
import * as semver from 'semver';
import {execSync} from 'child_process';
import * as https from 'https';
import {Platform} from "azure-pipelines-task-lib";

const goReleaserBinaryName = 'goreleaser';

const toolName: string = util.format(
    '%s%s',
    goReleaserBinaryName,
    getExecutableExtension(),
);

async function downloadGoReleaserBinary(
    cliDownloadUrl,
    fileName,
    version: string,
): Promise<string> {
  let cachedToolPath = toolLib.findLocalTool(goReleaserBinaryName, version);
  if (!cachedToolPath) {
    const downloadPath = await toolLib.downloadTool(cliDownloadUrl);
    let unzippedGoReleaserPath;
    if (isWindows()) {
      unzippedGoReleaserPath = await toolLib.extractZip(downloadPath);
    } else {
      unzippedGoReleaserPath = await toolLib.extractTar(downloadPath);
    }
    unzippedGoReleaserPath = path.join(unzippedGoReleaserPath, toolName);
    cachedToolPath = await toolLib.cacheFile(
        unzippedGoReleaserPath,
        toolName,
        goReleaserBinaryName,
        version,
    );
    toolLib.prependPath(path.dirname(unzippedGoReleaserPath));
  }

  const goReleaserPath = findGoReleaser(cachedToolPath);
  if (!goReleaserPath) {
    throw new Error(
        util.format('GoReleaser CLI not found in %s', cachedToolPath),
    );
  }
  fs.chmodSync(goReleaserPath, '777');
  return goReleaserPath;
}

function findGoReleaser(rootFolder: string) {
  const goReleaserPath = path.join(rootFolder, toolName);
  const allPaths = tl.find(rootFolder);
  const matchingResultsFiles = tl.match(allPaths, goReleaserPath, rootFolder);
  return matchingResultsFiles[0];
}

export function executeCliCommand(cliCommand, runningDir, stdio) {
  if (!fs.existsSync(runningDir)) {
    throw Error("GoReleaser execution path doesn't exist: " + runningDir);
  }
  try {
    if (!stdio) {
      stdio = [0, 1, 2];
    }
    tl.debug('Executing command: ' + cliCommand);
    return execSync(cliCommand, {cwd: runningDir, stdio: stdio});
  } catch (ex) {
    throw ex.toString();
  }
}

export async function getGoReleaserCLI(version, distribution: string) {
  const checkPro = suffix(distribution);
  const axiosInstance = axios.create({
    baseURL: 'https://goreleaser.com/static',
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });

  const options: any = {
    method: <Method>'GET',
    url: `/releases${checkPro}.json`,
  };
  tl.debug(version + ' ' + distribution);
  const response = await axiosInstance(options);
  if (response.data != undefined) {
    const tagsData = response.data.map((obj) => obj.tag_name);
    let checkedVersion;
    const cleanTags: Array<string> = tagsData.map((tag) =>
        cleanTag(tag),
    );
    if (version === 'latest') {
      checkedVersion = semver.maxSatisfying(cleanTags, '*');
      if (isPro(distribution)) {
        checkedVersion += suffix(distribution);
      }

    } else {

      const cleanVersion: string = cleanTag(version);
      checkedVersion =
          semver.maxSatisfying(cleanTags, cleanVersion) +
          suffix(distribution);
    }

    const filename = getGoreleaserFilename(distribution, checkedVersion);
    const downloadUrl = util.format(
        'https://github.com/goreleaser/%s/releases/download/%s/%s',
        distribution,
        checkedVersion,
        filename,
    );
    const cliDir = toolLib.findLocalTool(
        goReleaserBinaryName,
        checkedVersion,
    );
    if (cliDir != undefined) {
      return util.format('%s/%s', cliDir, toolName);
    } else {
      return downloadGoReleaserBinary(
          downloadUrl,
          filename,
          checkedVersion,
      );
    }
  }
}

function getGoreleaserFilename(distribution, version: string): string {
  let arch, platform, arm_version: string;
  switch (os.arch()) {
    case 'x64':
      arch = 'x86_64';
      break;
    case 'x32':
      arch = 'i386';
      break;
    case 'arm':
      arm_version = (process.config.variables as any).arm_version;
      arch = arm_version ? 'armv' + arm_version : 'arm';
      break;
    default:
      arch = os.arch();
      break;
  }

  switch (tl.getPlatform()) {
    case Platform.Linux:
      platform = 'Linux';
      break;
    case Platform.MacOS:
      platform = 'Darwin';
      // because of fat/all binary
      if (
          semver.gte(version, '0.183.0') ||
          semver.gte(version, '0.183.0-pro')
      ) {
        arch = 'all';
      }
      break;
    case Platform.Windows:
      platform = 'Windows';
      break;
    default:
      platform = 'Linux';
      break;
  }
  return util.format(
      'goreleaser%s_%s_%s.%s',
      suffix(distribution),
      platform,
      arch,
      getArchiveExtension(),
  );
}

function suffix(distribution: string): string {
  return isPro(distribution) ? '-pro' : '';
}

function isPro(distribution: string): boolean {
  return distribution === 'goreleaser-pro';
}

function cleanTag(tag: string): string {
  return tag.replace(/-pro$/, '');
}

function getExecutableExtension(): string {
  if (isWindows()) {
    return '.exe';
  }
  return '';
}

function getArchiveExtension(): string {
  if (isWindows()) {
    return 'zip';
  }
  return 'tar.gz';
}

function isWindows(): boolean {
  return tl.getPlatform() === Platform.Windows
}
