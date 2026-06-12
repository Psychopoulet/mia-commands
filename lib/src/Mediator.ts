// deps

    // natives
    import { join } from "node:path";
    import { readFile, writeFile } from "node:fs/promises";
    // import { spawn } from "node:child_process";

    // externals
    import { Mediator, readJSONFile, ConflictError, NotFoundError } from "node-pluginsmanager-plugin";
    import uniqid from "uniqid";

// types & interfaces

    // externals
    import type ContainerPattern from "node-containerpattern";
    import type { iEventsMinimal, iDescriptorUserOptions } from "node-pluginsmanager-plugin";

    // locals
    import type { operations, components } from "./Descriptor";

// module

export default class MediatorCommands extends Mediator<iEventsMinimal & {
    "initialized": [ ContainerPattern ];
    "released": [ ContainerPattern ];
    "error": [ components["schemas"]["PushEventPluginError"]["data"] ];
    "registered-command-added": [ components["schemas"]["PushEventRegisteredCommandAdded"]["data"] ];
    "registered-command-deleted": [ components["schemas"]["PushEventRegisteredCommandDeleted"]["data"] ];
    "running-command-running": [ components["schemas"]["PushEventRunningCommandRunning"]["data"] ];
    "running-command-ended": [ components["schemas"]["PushEventRunningCommandEnded"]["data"] ];
    "running-command-failed": [ components["schemas"]["PushEventRunningCommandFailed"]["data"] ];
    "running-command-log": [ components["schemas"]["PushEventRunningCommandLog"]["data"] ];
    "running-command-warning": [ components["schemas"]["PushEventRunningCommandWarning"]["data"] ];
}> {

    // private

        private readonly _commands: Array<components["schemas"]["CommandRunning"]> = [];
        private _registeredCommandsFile: string;

    // constructor

    public constructor (data: iDescriptorUserOptions) {

        super(data);

        this._registeredCommandsFile = join(this._externalResourcesDirectory, "registeredCommands.json");

    }

    protected _initWorkSpace (): Promise<void> {
        return Promise.resolve();
    }

    protected _releaseWorkSpace (): Promise<void> {
        return Promise.resolve();
    }

    // front files

    public getFrontIndex (): Promise<operations["getFrontIndex"]["responses"]["200"]["content"]["text/html"]> {

        return readFile(join(__dirname, "..", "..", "public", "index.html"), "utf-8").then((content: string): string => {

            return content

                .replace(/{{plugin.name}}/g, this.getPluginName())
                .replace(/{{plugin.version}}/g, this.getPluginVersion())
                .replace(/{{plugin.description}}/g, this.getPluginDescription());

        });

    }

    public getFrontApp (): Promise<operations["getFrontApp"]["responses"]["200"]["content"]["application/javascript"]> {

        return readFile(join(__dirname, "..", "..", "public", "dist", "bundle.min.js"), "utf-8").then((content: string): string => {

            return content

                .replace(/{{plugin.name}}/g, this.getPluginName())
                .replace(/{{plugin.version}}/g, this.getPluginVersion())
                .replace(/{{plugin.description}}/g, this.getPluginDescription());

        });

    }

    public getFrontAppMap (): Promise<string> { // tricks return to avoid costful parsing
        return readFile(join(__dirname, "..", "..", "public", "dist", "bundle.min.js.map"), "utf-8");
    }

    // <api>

    public getRegisteredCommands (): Promise<operations["getRegisteredCommands"]["responses"]["200"]["content"]["application/json"]> {
        return readJSONFile(this._registeredCommandsFile) as Promise<operations["getRegisteredCommands"]["responses"]["200"]["content"]["application/json"]>;
    }

    public registerCommand (
        urlParams: operations["registerCommand"]["parameters"],
        bodyParams: operations["registerCommand"]["requestBody"]["content"]["application/json"]
    ): Promise<operations["registerCommand"]["responses"]["201"]["content"]["application/json"]> {

        return this.getRegisteredCommands().then((registeredCommands: Array<components["schemas"]["RegisteredCommand"]>): Promise<void> => {

            if (registeredCommands.some((command: components["schemas"]["RegisteredCommand"]): boolean => {
                return command.name === bodyParams.name;
            })) {
                throw new ConflictError("Command '" + bodyParams.name + "' already registered");
            }

            registeredCommands.push(bodyParams);

            return writeFile(this._registeredCommandsFile, JSON.stringify(registeredCommands), "utf-8");

        }).then((): void => {

            this.emit("registered-command-added", bodyParams);

        });

    }

    public deleteRegisteredCommand (
        urlParams: operations["deleteRegisteredCommand"]["parameters"],
        bodyParams: operations["deleteRegisteredCommand"]["requestBody"]["content"]["application/json"]
    ): Promise<operations["deleteRegisteredCommand"]["responses"]["204"]["content"]["application/json"]> {


        return this.getRegisteredCommands().then((registeredCommands: Array<components["schemas"]["RegisteredCommand"]>): Promise<void> => {

            const index: number = registeredCommands.findIndex((command: components["schemas"]["RegisteredCommand"]): boolean => {
                return command.name === bodyParams.name;
            });

            if (-1 === index) {
                throw new NotFoundError("Command '" + bodyParams.name + "' not found");
            }

            registeredCommands.splice(index, 1);

            return writeFile(this._registeredCommandsFile, JSON.stringify(registeredCommands), "utf-8");

        }).then((): void => {

            this.emit("registered-command-deleted", bodyParams);

        });

    }

    // @TODO
    public getRunningCommands (): Promise<operations["getRunningCommands"]["responses"]["200"]["content"]["application/json"]> {
        return Promise.resolve([]);
    }

    // @TODO
    public runCommand (
        urlParams: operations["runCommand"]["parameters"],
        bodyParams: operations["runCommand"]["requestBody"]["content"]["application/json"]
    ): Promise<operations["runCommand"]["responses"]["201"]["content"]["application/json"]> {

        const newCommand: components["schemas"]["CommandRunning"] = {
            "id": uniqid(),
            "startedAt": new Date().toISOString(),
            ...bodyParams
        };

        this._commands.push(newCommand);

        setTimeout((): void => {

            const index: number = this._commands.findIndex((command: components["schemas"]["CommandRunning"]): boolean => {
                return command.id === newCommand.id;
            });

            if (-1 !== index) {
                this._commands.splice(index);
            }

        }, 5000);

        return Promise.resolve(newCommand);

    }

    // @TODO
    public stopRunningCommand (
        urlParams: operations["stopRunningCommand"]["parameters"],
        bodyParams: operations["stopRunningCommand"]["requestBody"]["content"]["application/json"]
    ): Promise<operations["stopRunningCommand"]["responses"]["204"]["content"]["application/json"]> {
        return Promise.resolve();
    }

}
