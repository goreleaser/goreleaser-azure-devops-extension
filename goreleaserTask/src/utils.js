'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoReleaserCLI = exports.executeCliCommand = void 0;
const tl = require("azure-pipelines-task-lib/task");
const path = require("path");
const fs = require("fs");
const toolLib = require("azure-pipelines-tool-lib/tool");
const os = require("os");
const util = require("util");
const axios_1 = require("axios");
const semver = require("semver");
const child_process_1 = require("child_process");
const https = require("https");
const azure_pipelines_task_lib_1 = require("azure-pipelines-task-lib");
const goReleaserBinaryName = 'goreleaser';
const toolName = util.format('%s%s', goReleaserBinaryName, getExecutableExtension());
function downloadGoReleaserBinary(cliDownloadUrl, fileName, version) {
    return __awaiter(this, void 0, void 0, function* () {
        let cachedToolPath = toolLib.findLocalTool(goReleaserBinaryName, version);
        if (!cachedToolPath) {
            const downloadPath = yield toolLib.downloadTool(cliDownloadUrl);
            let unzippedGoReleaserPath;
            if (isWindows()) {
                unzippedGoReleaserPath = yield toolLib.extractZip(downloadPath);
            }
            else {
                unzippedGoReleaserPath = yield toolLib.extractTar(downloadPath);
            }
            unzippedGoReleaserPath = path.join(unzippedGoReleaserPath, toolName);
            cachedToolPath = yield toolLib.cacheFile(unzippedGoReleaserPath, toolName, goReleaserBinaryName, version);
        }
        const goReleaserPath = findGoReleaser(cachedToolPath);
        if (!goReleaserPath) {
            throw new Error(util.format('GoReleaser CLI not found in %s', cachedToolPath));
        }
        fs.chmodSync(goReleaserPath, '777');
        return goReleaserPath;
    });
}
function findGoReleaser(rootFolder) {
    const goReleaserPath = path.join(rootFolder, toolName);
    const allPaths = tl.find(rootFolder);
    const matchingResultsFiles = tl.match(allPaths, goReleaserPath, rootFolder);
    return matchingResultsFiles[0];
}
function executeCliCommand(cliCommand, runningDir, stdio) {
    if (!fs.existsSync(runningDir)) {
        throw Error("GoReleaser execution path doesn't exist: " + runningDir);
    }
    try {
        if (!stdio) {
            stdio = [0, 1, 2];
        }
        tl.debug('Executing command: ' + cliCommand);
        return child_process_1.execSync(cliCommand, { cwd: runningDir, stdio: stdio });
    }
    catch (ex) {
        throw ex.toString();
    }
}
exports.executeCliCommand = executeCliCommand;
function getGoReleaserCLI(version, distribution) {
    return __awaiter(this, void 0, void 0, function* () {
        const checkPro = suffix(distribution);
        const axiosInstance = axios_1.default.create({
            baseURL: 'https://goreleaser.com/static',
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        });
        const options = {
            method: 'GET',
            url: `/releases${checkPro}.json`,
        };
        tl.debug(version + ' ' + distribution);
        const response = yield axiosInstance(options);
        if (response.data != undefined) {
            const tagsData = response.data.map((obj) => obj.tag_name);
            let checkedVersion;
            if (version === 'latest' || !isPro(distribution)) {
                checkedVersion = semver.maxSatisfying(tagsData, '*');
            }
            else {
                const cleanTags = tagsData.map((tag) => cleanTag(tag));
                const cleanVersion = cleanTag(version);
                checkedVersion =
                    semver.maxSatisfying(cleanTags, cleanVersion) +
                        suffix(distribution);
            }
            const filename = getGoreleaserFilename(distribution, checkedVersion);
            const downloadUrl = util.format('https://github.com/goreleaser/%s/releases/download/%s/%s', distribution, checkedVersion, filename);
            const cliDir = toolLib.findLocalTool(goReleaserBinaryName, checkedVersion);
            if (cliDir != undefined) {
                return util.format('%s/%s', cliDir, toolName);
            }
            else {
                return downloadGoReleaserBinary(downloadUrl, filename, checkedVersion);
            }
        }
    });
}
exports.getGoReleaserCLI = getGoReleaserCLI;
function getGoreleaserFilename(distribution, version) {
    let arch, platform, arm_version;
    switch (os.arch()) {
        case 'x64':
            arch = 'x86_64';
            break;
        case 'x32':
            arch = 'i386';
            break;
        case 'arm':
            arm_version = process.config.variables.arm_version;
            arch = arm_version ? 'armv' + arm_version : 'arm';
            break;
        default:
            arch = os.arch();
            break;
    }
    switch (tl.getPlatform()) {
        case azure_pipelines_task_lib_1.Platform.Linux:
            platform = 'Linux';
            break;
        case azure_pipelines_task_lib_1.Platform.MacOS:
            platform = 'Darwin';
            // because of fat/all binary
            if (semver.gte(version, '0.183.0') ||
                semver.gte(version, '0.183.0-pro')) {
                arch = 'all';
            }
            break;
        case azure_pipelines_task_lib_1.Platform.Windows:
            platform = 'Windows';
            break;
        default:
            platform = 'Linux';
            break;
    }
    return util.format('goreleaser%s_%s_%s.%s', suffix(distribution), platform, arch, getArchiveExtension());
}
function suffix(distribution) {
    return isPro(distribution) ? '-pro' : '';
}
function isPro(distribution) {
    return distribution === 'goreleaser-pro';
}
function cleanTag(tag) {
    return tag.replace(/-pro$/, '');
}
function getExecutableExtension() {
    if (isWindows()) {
        return '.exe';
    }
    return '';
}
function getArchiveExtension() {
    if (isWindows()) {
        return 'zip';
    }
    return 'tar.gz';
}
function isWindows() {
    return tl.getPlatform() === azure_pipelines_task_lib_1.Platform.Windows;
}
