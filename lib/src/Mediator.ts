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

        // <init work space>

        return Promise.resolve();

    }

    protected _releaseWorkSpace (): Promise<void> {

        // <release work space>

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

    public executeCommand (
        urlParams: operations["executeCommand"]["parameters"],
        bodyParams: operations["executeCommand"]["requestBody"]["content"]["application/json"]
    ): Promise<operations["executeCommand"]["responses"]["201"]["content"]["application/json"]> {

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

}
