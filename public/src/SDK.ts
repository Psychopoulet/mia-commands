// deps

    // natives
    import { EventEmitter } from "events";

// types & interfaces

    // natives
    type Timeout = ReturnType<typeof setTimeout>;

    // locals
    import type { components, paths, operations } from "./Descriptor";
    type tEvents = components["schemas"]["PushEventPluginInitialized"] | components["schemas"]["PushEventPluginReleased"] | components["schemas"]["PushEventPluginError"]
        | components["schemas"]["PushEventRegisteredCommandAdded"] | components["schemas"]["PushEventRegisteredCommandDeleted"]
        | components["schemas"]["PushEventRunningCommandRunning"] | components["schemas"]["PushEventRunningCommandEnded"] | components["schemas"]["PushEventRunningCommandFailed"]
        | components["schemas"]["PushEventRunningCommandLog"] | components["schemas"]["PushEventRunningCommandWarning"];

    type HttpMethodsOf<P extends keyof paths> = {
        [M in keyof paths[P]]: paths[P][M] extends { "responses": unknown }
            ? M
            : never;
    }[keyof paths[P]];

// component

export class SDK extends EventEmitter<{
    "connected": [];
    "disconnected": [ number, string ];
    "initialized": [];
    "released": [];
    "error": [ components["schemas"]["PushEventPluginError"]["data"] ];
    "registered-command-added": [ components["schemas"]["PushEventRegisteredCommandAdded"]["data"] ];
    "registered-command-deleted": [ components["schemas"]["PushEventRegisteredCommandDeleted"]["data"] ];
    "running-command-running": [ components["schemas"]["PushEventRunningCommandRunning"]["data"] ];
    "running-command-ended": [ components["schemas"]["PushEventRunningCommandEnded"]["data"] ];
    "running-command-failed": [ components["schemas"]["PushEventRunningCommandFailed"]["data"] ];
    "running-command-log": [ components["schemas"]["PushEventRunningCommandLog"]["data"] ];
    "running-command-warning": [ components["schemas"]["PushEventRunningCommandWarning"]["data"] ];
}> {

    // protected

        protected _socket: WebSocket | null;
        protected _reconnectTimeout: Timeout | null;

    // constructor

    public constructor () {

        super();

        this._socket = null;
        this._reconnectTimeout = null;

    }

    // protected methods

    protected _parseResponse (res: Response): Promise<unknown> {

        if (res.ok) {

            return new Promise((resolve: (content: unknown) => void, reject: (error: Error) => void): void => {

                res.text().then((content: string): void => {

                    try {
                        return resolve(JSON.parse(content));
                    }
                    catch (e: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
                        return resolve(content);
                    }

                }).catch((err: Error): void => {
                    console.warn(err);
                    return reject(new Error("Impossible to parse response"));
                });

            });

        }

        return new Promise((resolve: unknown, reject: (error: Error) => void): void => {

            res.json().then((content: components["schemas"]["Error"]): void => {
                return reject(new Error(content.message));
            }).catch((): void => {
                return reject(new Error("Problem with request getPluginStatus has status '" + res.status + "' (" + res.statusText + ")"));
            });

        });

    }

    // public methods

    public connect (): void {

        if (WebSocket.OPEN === this._socket?.readyState) {
            return;
        }

        if (this._reconnectTimeout) {
            return;
        }

        this._socket = new WebSocket(
            ("https:" === window.location.protocol ? "wss:" : "ws:")
            + "//" + window.location.host
        );

        this._socket.onopen = (): void => {
            this.emit("connected");
        };

        this._socket.onclose = (event: CloseEvent): void => {

            this.emit("disconnected", event.code, event.reason);

            // normal closure
            if (1000 === event.code) {
                return;
            }

            this._reconnectTimeout = setTimeout((): void => {
                this._reconnectTimeout = null;
                return this.connect();
            }, 1000);

        };

        this._socket.onerror = (evt: Event): void => {

            // avoid catching error on reconnection
            if (evt instanceof ErrorEvent) {

                this.emit("error", {
                    "code": "unknown",
                    "message": evt.message
                });

            }

        };

        this._socket.onmessage = (event: MessageEvent<string>): void => {

            const parsedMessage: tEvents = JSON.parse(event.data) as tEvents;

            // must disable the rule because the plugin name can be sended by another plugin
            if ("mia-commands" === parsedMessage.plugin) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition

                switch (parsedMessage.command) {

                    case "initialized":
                        this.emit("initialized");
                    break;
                    case "released":
                        this.emit("released");
                    break;
                    case "error":
                        this.emit("error", parsedMessage.data);
                    break;

                    case "registered-command-added":
                        this.emit("registered-command-added", parsedMessage.data);
                    break;
                    case "registered-command-deleted":
                        this.emit("registered-command-deleted", parsedMessage.data);
                    break;

                    case "running-command-running":
                        this.emit("running-command-running", parsedMessage.data);
                    break;
                    case "running-command-ended":
                        this.emit("running-command-ended", parsedMessage.data);
                    break;
                    case "running-command-failed":
                        this.emit("running-command-failed", parsedMessage.data);
                    break;
                    case "running-command-log":
                        this.emit("running-command-log", parsedMessage.data);
                    break;
                    case "running-command-warning":
                        this.emit("running-command-warning", parsedMessage.data);
                    break;

                    default:
                        // nothing to do here
                    break;

                }

            }

        };

    }

    public disconnect (): void {

        if (this._reconnectTimeout) {
            clearTimeout(this._reconnectTimeout);
            this._reconnectTimeout = null;
        }

        if (this._socket
            && (
                WebSocket.CONNECTING === this._socket.readyState
                || WebSocket.OPEN === this._socket.readyState
            )
        ) {
            this._socket.close(1000, "Normal closure");
        }

        this._socket = null;

    }

    // api

    public getPluginDescriptor (): Promise<operations["getPluginDescriptor"]["responses"]["200"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-commands/api/descriptor";
        const method: HttpMethodsOf<typeof url> = "get";

        return fetch(url, {
            "method": method,
            "headers": {
                "Content-Type": "application/json"
            }
        }).then((res: Response): Promise<operations["getPluginDescriptor"]["responses"]["200"]["content"]["application/json"]> => {

            return this._parseResponse(res) as Promise<operations["getPluginDescriptor"]["responses"]["200"]["content"]["application/json"]>;

        });

    }

    public getPluginStatus (): Promise<operations["getPluginStatus"]["responses"]["200"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-commands/api/status";
        const method: HttpMethodsOf<typeof url> = "get";

        return fetch(url, {
            "method": method,
            "headers": {
                "Content-Type": "application/json"
            }
        }).then((res: Response): Promise<operations["getPluginStatus"]["responses"]["200"]["content"]["application/json"]> => {

            if (404 === res.status) {
                return Promise.resolve("RELEASED");
            }

            return this._parseResponse(res) as Promise<operations["getPluginStatus"]["responses"]["200"]["content"]["application/json"]>;

        });

    }

    public getRegisteredCommands (): Promise<operations["getRegisteredCommands"]["responses"]["200"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-commands/api/registered-commands";
        const method: HttpMethodsOf<typeof url> = "get";

        return fetch(url, {
            "method": method,
            "headers": {
                "Content-Type": "application/json"
            }
        }).then((res: Response): Promise<operations["getRegisteredCommands"]["responses"]["200"]["content"]["application/json"]> => {

            return this._parseResponse(res) as Promise<operations["getRegisteredCommands"]["responses"]["200"]["content"]["application/json"]>;

        });

    }

    public registerCommand (command: components["schemas"]["Command"]): Promise<operations["registerCommand"]["responses"]["201"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-commands/api/registered-commands";
        const method: HttpMethodsOf<typeof url> = "put";

        return fetch(url, {
            "method": method,
            "headers": {
                "Content-Type": "application/json"
            }
        }).then((res: Response): Promise<operations["registerCommand"]["responses"]["201"]["content"]["application/json"]> => {

            return this._parseResponse(res) as Promise<operations["registerCommand"]["responses"]["201"]["content"]["application/json"]>;

        });

    }

    public deleteRegisteredCommand (command: components["schemas"]["Command"]): Promise<operations["deleteRegisteredCommand"]["responses"]["204"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-commands/api/registered-commands";
        const method: HttpMethodsOf<typeof url> = "delete";

        return fetch(url, {
            "method": method,
            "headers": {
                "Content-Type": "application/json"
            }
        }).then((res: Response): Promise<operations["deleteRegisteredCommand"]["responses"]["204"]["content"]["application/json"]> => {

            return this._parseResponse(res) as Promise<operations["deleteRegisteredCommand"]["responses"]["204"]["content"]["application/json"]>;

        });

    }

    public getRunningCommands (): Promise<operations["getRunningCommands"]["responses"]["200"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-commands/api/running-commands";
        const method: HttpMethodsOf<typeof url> = "get";

        return fetch(url, {
            "method": method,
            "headers": {
                "Content-Type": "application/json"
            }
        }).then((res: Response): Promise<operations["getRunningCommands"]["responses"]["200"]["content"]["application/json"]> => {

            return this._parseResponse(res) as Promise<operations["getRunningCommands"]["responses"]["200"]["content"]["application/json"]>;

        });

    }

    public runCommand (command: components["schemas"]["Command"]): Promise<operations["runCommand"]["responses"]["201"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-commands/api/running-commands";
        const method: HttpMethodsOf<typeof url> = "put";

        return fetch(url, {
            "method": method,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({
                "command": command
            })
        }).then((res: Response): Promise<operations["runCommand"]["responses"]["201"]["content"]["application/json"]> => {

            return this._parseResponse(res) as Promise<operations["runCommand"]["responses"]["201"]["content"]["application/json"]>;

        });

    }

    public stopRunningCommand (command: components["schemas"]["Command"]): Promise<operations["stopRunningCommand"]["responses"]["204"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-commands/api/running-commands";
        const method: HttpMethodsOf<typeof url> = "delete";

        return fetch(url, {
            "method": method,
            "headers": {
                "Content-Type": "application/json"
            }
        }).then((res: Response): Promise<operations["stopRunningCommand"]["responses"]["204"]["content"]["application/json"]> => {

            return this._parseResponse(res) as Promise<operations["stopRunningCommand"]["responses"]["204"]["content"]["application/json"]>;

        });

    }

}

let _sdk: SDK | null = null;

export default function getSDK (): SDK {

    _sdk ??= new SDK();

    return _sdk;

}
