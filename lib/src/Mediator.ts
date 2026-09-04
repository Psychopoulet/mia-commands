// deps

    // natives
    import { join } from "node:path";
    import { readFile, writeFile } from "node:fs/promises";
    import { spawn, exec } from "node:child_process";

    // externals
    import {
        Mediator,
        readJSONFile, isPlainObject,
        ConflictError, NotFoundError
    } from "node-pluginsmanager-plugin";

    // locals
    import getProcessEnv from "./utils/getProcessEnv";

// types & interfaces

    // natives
    import type { ChildProcess, SpawnOptions } from "node:child_process";

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

        private readonly _runningCommands: Array<components["schemas"]["RunningCommand"]> = [];
        private readonly _stoppingPids: Set<number> = new Set();
        private readonly _registeredCommandsFile: string;

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

    // private

    private _readPublic (relativePath: string): Promise<string> {

        return readFile(join(__dirname, "..", "..", "public", relativePath), "utf-8");

    }

    // front files

    public getFrontIndex (): Promise<operations["getFrontIndex"]["responses"]["200"]["content"]["text/html"]> {

        return this._readPublic("index.html").then((content: string): string => {

            return content

                .replace(/{{plugin.name}}/g, this.getPluginName())
                .replace(/{{plugin.version}}/g, this.getPluginVersion())
                .replace(/{{plugin.description}}/g, this.getPluginDescription());

        });

    }

    public getFrontApp (): Promise<operations["getFrontApp"]["responses"]["200"]["content"]["application/javascript"]> {

        return this._readPublic(join("dist", "bundle.min.js")).then((content: string): string => {

            return content

                .replace(/{{plugin.name}}/g, this.getPluginName())
                .replace(/{{plugin.version}}/g, this.getPluginVersion())
                .replace(/{{plugin.description}}/g, this.getPluginDescription());

        });

    }

    public getFrontAppMap (): Promise<string> { // tricks return to avoid costful parsing
        return this._readPublic(join("dist", "bundle.min.js.map"));
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

    public getRunningCommands (): Promise<operations["getRunningCommands"]["responses"]["200"]["content"]["application/json"]> {

        return Promise.resolve(this._runningCommands);

    }

    public runCommand (
        urlParams: operations["runCommand"]["parameters"],
        bodyParams: operations["runCommand"]["requestBody"]["content"]["application/json"]
    ): Promise<operations["runCommand"]["responses"]["201"]["content"]["application/json"]> {

        const options: SpawnOptions = {};

        if ("string" === typeof bodyParams.command.workingDirectory && "" !== bodyParams.command.workingDirectory.trim()) {
            options.cwd = bodyParams.command.workingDirectory;
        }
        if (isPlainObject(bodyParams.command.environmentVariables)) {
            options.env = { ...getProcessEnv(), ...bodyParams.command.environmentVariables };
        }
        if ("boolean" === typeof bodyParams.command.detached) {
            options.detached = bodyParams.command.detached;
        }
        if ("boolean" === typeof bodyParams.command.windowsHide) {
            options.windowsHide = bodyParams.command.windowsHide;
        }
        if ("number" === typeof bodyParams.command.timeout) {
            options.timeout = bodyParams.command.timeout;
        }

        const childProcess: ChildProcess = spawn(bodyParams.command.binary, bodyParams.command.arguments ?? [], options);

        const newCommand: components["schemas"]["RunningCommand"] = {
            "pid": childProcess.pid as number,
            "startedAt": new Date().toISOString(),
            ...bodyParams
        };

        this._runningCommands.push(newCommand);

        this.emit("running-command-running", newCommand);

        let lastError: string = "";

        childProcess.on("error", (err: Error): void => {
            lastError = err.message;
        }).on("close", (code: number | null, signal: string | null): void => {

            const wasStopping: boolean = this._stoppingPids.delete(newCommand.pid);

            if (wasStopping || 0 === code) {

                this.emit("running-command-ended", newCommand);

            }
            else {

                this.emit("running-command-failed", {
                    "command": newCommand,
                    "error": {
                        "code": signal ?? "UNKNOWN",
                        "message": lastError
                    }
                });

            }

            const index: number = this._runningCommands.findIndex((command: components["schemas"]["RunningCommand"]): boolean => {
                return command.pid === newCommand.pid;
            });

            if (-1 !== index) {
                this._runningCommands.splice(index, 1);
            }

        });

        childProcess.stdout?.setEncoding("utf-8");
        childProcess.stdout?.on("data", (data: string): void => {

            this.emit("running-command-log", {
                "command": newCommand,
                "content": data
            });

        });

        childProcess.stderr?.setEncoding("utf-8");
        childProcess.stderr?.on("data", (data: string): void => {

            if ("" === lastError) {
                lastError = data;
            }

            this.emit("running-command-warning", {
                "command": newCommand,
                "content": data
            });

        });

        return Promise.resolve(newCommand);

    }

    public stopRunningCommand (
        urlParams: operations["stopRunningCommand"]["parameters"],
        bodyParams: operations["stopRunningCommand"]["requestBody"]["content"]["application/json"]
    ): Promise<operations["stopRunningCommand"]["responses"]["204"]["content"]["application/json"]> {

        const index: number = this._runningCommands.findIndex((command: components["schemas"]["RunningCommand"]): boolean => {
            return command.pid === bodyParams.pid;
        });

        if (-1 === index) {
            throw new NotFoundError("Command '" + bodyParams.name + "' with pid '" + bodyParams.pid + "' not found");
        }

        this._stoppingPids.add(bodyParams.pid);

        return new Promise((resolve: (value: unknown) => void, reject: (error: Error) => void): void => {

            if ("win32" === process.platform) {

                exec("taskkill /PID " + bodyParams.pid + " /T /F", { "windowsHide": true }, (err: Error | null, stdout: string): void => {

                    if (err) {
                        return reject(err);
                    }

                    return resolve(stdout);

                });

                return;

            }

            try {

                process.kill(bodyParams.pid, "SIGTERM");

                resolve("ok");

            }
            catch (err: unknown) {

                reject(err instanceof Error ? err : new Error(String(err)));

            }

        }).catch((err: Error): Error => {

            // no need to remove the command from the list because it will be removed by the "close" event

            this._stoppingPids.delete(bodyParams.pid);

            return err;

        });

    }

}
