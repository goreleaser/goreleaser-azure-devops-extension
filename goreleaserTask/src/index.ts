import tl = require('azure-pipelines-task-lib/task');
import utils = require('./utils');
import * as util from 'util';

class Params {
    version = 'latest';
    distribution = 'goreleaser';
    installOnly = false;
    args = '';
    workdir = '$(Build.SourcesDirectory)';
}

function prepare(): Params | undefined {
    try {
        const p = new Params();
        const version: string = tl.getInput('version') || 'latest';
        if (version != undefined) {
            tl.debug(version);
            p.version = version;
        }
        const distribution: string =
            tl.getInput('distribution', true) || 'goreleaser';
        if (distribution != undefined) {
            tl.debug(distribution);
            p.distribution = distribution;
        }
        const args: string | undefined = tl.getInput('args', false);
        if (args != undefined) {
            tl.debug(args);
            p.args = args;
        }
        const installOnly: boolean | false = tl.getBoolInput(
            'installOnly',
            false,
        );
        tl.debug(String(installOnly));
        p.installOnly = installOnly;
        const workdir: string | undefined = tl.getInput('workdir', false);
        if (workdir != undefined) {
            tl.debug(workdir);
            p.workdir = workdir;
        }
        return p;
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

async function run(input: Params) {
    try {
        const cli = await utils.getGoReleaserCLI(
            input.version,
            input.distribution,
        );
        if (input.installOnly) {
            tl.setResult(tl.TaskResult.Succeeded, 'Build Succeeded.');
        } else {
            const command = util.format('%s %s', cli, input.args);
            utils.executeCliCommand(command, input.workdir, null);

            tl.setResult(tl.TaskResult.Succeeded, 'Build Succeeded.');
        }
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

const input: Params | undefined = prepare();
if (input !== undefined) {
    run(input)
        .then()
        .catch((err) => {
            console.error(err);
        });
}
