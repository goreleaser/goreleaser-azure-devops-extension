import tl = require('azure-pipelines-task-lib/task');
import utils = require('./utils');

class Params {
  version = 'latest';
  distribution = 'goreleaser';
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
    return p;
  } catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

async function run(input: Params) {
  try {
    await utils.getGoReleaserCLI(
        input.version,
        input.distribution,
    );
    tl.setResult(tl.TaskResult.Succeeded, 'Download Succeeded.');
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
