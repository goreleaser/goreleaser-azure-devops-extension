/// <reference types="node" />
export declare function executeCliCommand(
    cliCommand: any,
    runningDir: any,
    stdio: any,
): Buffer;
export declare function getGoReleaserCLI(
    version: any,
    distribution: string,
): Promise<string | undefined>;
