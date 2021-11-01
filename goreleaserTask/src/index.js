"use strict";
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
const tl = require("azure-pipelines-task-lib/task");
const utils = require("./utils");
const util = require("util");
class Params {
    constructor() {
        this.version = 'latest';
        this.distribution = 'goreleaser';
        this.installOnly = false;
        this.args = '';
        this.workdir = '$(Build.SourcesDirectory)';
    }
}
function prepare() {
    try {
        const p = new Params();
        const version = tl.getInput('version') || 'latest';
        if (version != undefined) {
            tl.debug(version);
            p.version = version;
        }
        const distribution = tl.getInput('distribution', true) || 'goreleaser';
        if (distribution != undefined) {
            tl.debug(distribution);
            p.distribution = distribution;
        }
        const args = tl.getInput('args', false);
        if (args != undefined) {
            tl.debug(args);
            p.args = args;
        }
        const installOnly = tl.getBoolInput('installOnly', false);
        tl.debug(String(installOnly));
        p.installOnly = installOnly;
        const workdir = tl.getInput('workdir', false);
        if (workdir != undefined) {
            tl.debug(workdir);
            p.workdir = workdir;
        }
        return p;
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}
function run(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cli = yield utils.getGoReleaserCLI(input.version, input.distribution);
            if (input.installOnly) {
                tl.setResult(tl.TaskResult.Succeeded, 'Build Succeeded.');
            }
            else {
                const command = util.format('%s %s', cli, input.args);
                utils.executeCliCommand(command, input.workdir, null);
                tl.setResult(tl.TaskResult.Succeeded, 'Build Succeeded.');
            }
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
const input = prepare();
if (input !== undefined) {
    run(input)
        .then()
        .catch((err) => {
        console.error(err);
    });
}
