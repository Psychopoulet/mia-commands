// deps

    // externals
    import { Server } from "node-pluginsmanager-plugin";

// types & interfaces

    // locals
    import type MediatorCommands from "./Mediator";
    import type { components } from "./Descriptor";

// module

export default class ServerCommands extends Server {

    public _initWorkSpace (): Promise<void> {

        (this._Mediator as MediatorCommands)

            .on("initialized", this._onPluginInitialized)
            .on("released", this._onPluginReleased)
            .on("error", this._onPluginError)
            .on("registered-command-added", this._onRegisteredCommandAdded)
            .on("registered-command-deleted", this._onRegisteredCommandDeleted)
            .on("running-command-running", this._onRunningCommandRunning)
            .on("running-command-ended", this._onRunningCommandEnded)
            .on("running-command-failed", this._onRunningCommandFailed)
            .on("running-command-log", this._onRunningCommandLog)
            .on("running-command-warning", this._onRunningCommandWarning);

        return Promise.resolve();

    }

    public _releaseWorkSpace (): Promise<void> {

        (this._Mediator as MediatorCommands)

            .off("initialized", this._onPluginInitialized)
            .off("released", this._onPluginReleased)
            .off("error", this._onPluginError)
            .off("registered-command-added", this._onRegisteredCommandAdded)
            .off("registered-command-deleted", this._onRegisteredCommandDeleted)
            .off("running-command-running", this._onRunningCommandRunning)
            .off("running-command-ended", this._onRunningCommandEnded)
            .off("running-command-failed", this._onRunningCommandFailed)
            .off("running-command-log", this._onRunningCommandLog)
            .off("running-command-warning", this._onRunningCommandWarning);

        return Promise.resolve();

    }

    // <events>

    private readonly _onPluginInitialized = (): void => {

        this.push("initialized");

    };

    private readonly _onPluginReleased = (): void => {

        this.push("released");

    };

    private readonly _onPluginError = (data: components["schemas"]["PushEventPluginError"]["data"]): void => {

        this.push("error", data);

    };

    private readonly _onRegisteredCommandAdded = (data: components["schemas"]["PushEventRegisteredCommandAdded"]["data"]): void => {

        this.push("registered-command-added", data);

    };

    private readonly _onRegisteredCommandDeleted = (data: components["schemas"]["PushEventRegisteredCommandDeleted"]["data"]): void => {

        this.push("registered-command-deleted", data);

    };

    private readonly _onRunningCommandRunning = (data: components["schemas"]["PushEventRunningCommandRunning"]["data"]): void => {

        this.push("running-command-running", data);

    };

    private readonly _onRunningCommandEnded = (data: components["schemas"]["PushEventRunningCommandEnded"]["data"]): void => {

        this.push("running-command-ended", data);

    };

    private readonly _onRunningCommandFailed = (data: components["schemas"]["PushEventRunningCommandFailed"]["data"]): void => {

        this.push("running-command-failed", data);

    };

    private readonly _onRunningCommandLog = (data: components["schemas"]["PushEventRunningCommandLog"]["data"]): void => {

        this.push("running-command-log", data);

    };

    private readonly _onRunningCommandWarning = (data: components["schemas"]["PushEventRunningCommandWarning"]["data"]): void => {

        this.push("running-command-warning", data);

    };
}
