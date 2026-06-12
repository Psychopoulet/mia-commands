// deps

    // natives
    import { readFile } from "node:fs/promises";
    import { join } from "node:path";

    // externals
    import { Mediator } from "node-pluginsmanager-plugin";
    import uniqid from "uniqid";

// types & interfaces

    // natives

    // externals
    import type ContainerPattern from "node-containerpattern";
    import type { iEventsMinimal } from "node-pluginsmanager-plugin";

    // locals
    import type { operations, components } from "./Descriptor";

// module

export default class MediatorCommands extends Mediator<iEventsMinimal & {
    "initialized": [ ContainerPattern ];
    "released": [ ContainerPattern ];
    "error": [ components["schemas"]["PushEventPluginError"]["data"] ];
}> {

    // private

        private _commands: Array<components["schemas"]["CommandRunning"]> = [];

    // constructor

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

    // @TODO
    public getRegisteredCommands (): Promise<operations["getRegisteredCommands"]["responses"]["200"]["content"]["application/json"]> {
        return Promise.resolve([]);
    }

    // @TODO
    public registerCommand (
        urlParams: operations["registerCommand"]["parameters"],
        bodyParams: operations["registerCommand"]["requestBody"]["content"]["application/json"]
    ): Promise<operations["registerCommand"]["responses"]["201"]["content"]["application/json"]> {
        return Promise.resolve();
    }

    // @TODO
    public deleteRegisteredCommand (
        urlParams: operations["deleteRegisteredCommand"]["parameters"],
        bodyParams: operations["deleteRegisteredCommand"]["requestBody"]["content"]["application/json"]
    ): Promise<operations["deleteRegisteredCommand"]["responses"]["204"]["content"]["application/json"]> {
        return Promise.resolve();
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

            this._commands = this._commands.filter((command: components["schemas"]["CommandRunning"]): boolean => {
                return command.id !== newCommand.id;
            });

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
