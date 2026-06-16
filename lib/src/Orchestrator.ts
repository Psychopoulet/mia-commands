// deps

    // natives
    import { join } from "node:path";
    import { writeFile, mkdir, rm } from "node:fs/promises";

    // externals
    import { Orchestrator, isFile, isDirectory } from "node-pluginsmanager-plugin";

// types & interfaces

    // externals
    import type { iOrchestratorOptions } from "node-pluginsmanager-plugin";

// module

export default class OrchestratorCommands extends Orchestrator {

    public constructor (data: iOrchestratorOptions) {

        super({
            ...data,
            "packageFile": join(__dirname, "..", "..", "package.json"),
            "descriptorFile": join(__dirname, "..", "data", "Descriptor.json"),
            "mediatorFile": join(__dirname, "Mediator.js"),
            "serverFile": join(__dirname, "Server.js")
        });

    }

    protected _initWorkSpace (): Promise<void> {

        return this.install();

    }

    public install (): Promise<void> {

        return isDirectory(this._externalResourcesDirectory).then((check: boolean): Promise<string | undefined> => {

            if (check) {
                return Promise.resolve("");
            }

            return mkdir(this._externalResourcesDirectory, { "recursive": true });

        }).then((): Promise<void> => {

            const registeredCommandsFile = join(this._externalResourcesDirectory, "registeredCommands.json");

            return isFile(registeredCommandsFile).then((check: boolean): Promise<void> => {

                if (check) {
                    return Promise.resolve();
                }

                return writeFile(registeredCommandsFile, "[]", "utf-8");

            });

        });

    }

    public uninstall (): Promise<void> {

        return isDirectory(this._externalResourcesDirectory).then((check: boolean): Promise<void> | void => {

            if (!check) {
                return Promise.resolve();
            }

            return rm(this._externalResourcesDirectory, { "recursive": true });

        });

    }

}
