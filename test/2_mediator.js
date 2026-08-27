// deps

    // natives
    const { join } = require("node:path");
    const { mkdir, mkdtemp, readFile, rm, writeFile } = require("node:fs/promises");
    const { tmpdir } = require("node:os");
    const childProcess = require("node:child_process");
    const { EventEmitter } = require("node:events");
    const { deepStrictEqual, rejects, strictEqual } = require("node:assert");

    // externals
    const { ConflictError, NotFoundError } = require("node-pluginsmanager-plugin");

    // locals
    const Mediator = require("../lib/cjs/Mediator.js").default;

// consts

    const DESCRIPTOR_FILE = join(__dirname, "..", "lib", "data", "Descriptor.json");
    const DIST_DIR = join(__dirname, "..", "public", "dist");
    const BUNDLE_FILE = join(DIST_DIR, "bundle.min.js");
    const MAP_FILE = join(DIST_DIR, "bundle.min.js.map");
    const MAX_TIMEOUT = 10000;

    const originalPlatform = Object.getOwnPropertyDescriptor(process, "platform");
    const originalKill = process.kill.bind(process);
    const originalExec = childProcess.exec.bind(childProcess);

// module

function waitForEvent (emitter, eventName) {

    return new Promise((resolve, reject) => {

        const timeout = setTimeout(() => {

            reject(new Error("Timeout waiting for " + eventName));

        }, MAX_TIMEOUT);

        emitter.once(eventName, (payload) => {

            clearTimeout(timeout);
            resolve(payload);

        });

    });

}

function killPid (pid) {

    return new Promise((resolve) => {

        try {

            originalKill(pid);

        }
        catch (err) {

            strictEqual("object" === typeof err, true);

        }

        resolve();

    });

}

function restoreProcessHooks () {

    Object.defineProperty(process, "platform", originalPlatform);
    process.kill = originalKill;
    childProcess.exec = originalExec;

}

// tests

describe("mediator", () => {

    let descriptor = null;
    let resourcesDir = "";
    let commandsFile = "";
    let mediator = null;

    before(() => {

        return readFile(DESCRIPTOR_FILE, "utf-8").then((content) => {

            descriptor = JSON.parse(content);

            return mkdtemp(join(tmpdir(), "mia-commands-"));

        }).then((created) => {

            resourcesDir = created;
            commandsFile = join(resourcesDir, "registeredCommands.json");

            return mkdir(DIST_DIR, {
                "recursive": true
            });

        }).then(() => {

            return writeFile(BUNDLE_FILE, "{{plugin.name}}|{{plugin.version}}|{{plugin.description}}", "utf-8");

        }).then(() => {

            return writeFile(MAP_FILE, "sourcemap", "utf-8");

        });

    });

    beforeEach(() => {

        mediator = new Mediator({
            "descriptor": descriptor,
            "externalResourcesDirectory": resourcesDir
        });

        return writeFile(commandsFile, "[]", "utf-8");

    });

    afterEach(() => {

        restoreProcessHooks();

    });

    after(() => {

        restoreProcessHooks();

        return Promise.all([
            rm(resourcesDir, {
                "force": true,
                "recursive": true
            }),
            rm(BUNDLE_FILE, {
                "force": true
            }),
            rm(MAP_FILE, {
                "force": true
            })
        ]);

    });

    it("should init and release workspace", () => {

        return mediator._initWorkSpace().then(() => {

            return mediator._releaseWorkSpace();

        });

    }).timeout(MAX_TIMEOUT);

    it("should replace plugin placeholders in front index", () => {

        return mediator.getFrontIndex().then((content) => {

            strictEqual(content.includes(descriptor.info.title), true);
            strictEqual(content.includes("{{plugin.name}}"), false);

        });

    }).timeout(MAX_TIMEOUT);

    it("should replace plugin placeholders in front app", () => {

        return mediator.getFrontApp().then((content) => {

            strictEqual(content, descriptor.info.title + "|" + descriptor.info.version + "|" + descriptor.info.description);

        });

    }).timeout(MAX_TIMEOUT);

    it("should return front app sourcemap", () => {

        return mediator.getFrontAppMap().then((content) => {

            strictEqual(content, "sourcemap");

        });

    }).timeout(MAX_TIMEOUT);

    it("should return registered commands", () => {

        return mediator.getRegisteredCommands().then((commands) => {

            deepStrictEqual(commands, []);

        });

    }).timeout(MAX_TIMEOUT);

    it("should register a command and emit registered-command-added", () => {

        const command = {
            "command": {
                "binary": process.execPath
            },
            "name": "hello"
        };

        let emitted = null;

        mediator.once("registered-command-added", (payload) => {

            emitted = payload;

        });

        return mediator.registerCommand({}, command).then(() => {

            deepStrictEqual(emitted, command);

            return mediator.getRegisteredCommands();

        }).then((commands) => {

            deepStrictEqual(commands, [ command ]);

        });

    }).timeout(MAX_TIMEOUT);

    it("should reject registering an existing command", () => {

        const command = {
            "command": {
                "binary": process.execPath
            },
            "name": "hello"
        };

        return mediator.registerCommand({}, command).then(() => {

            return rejects(() => {

                return mediator.registerCommand({}, command);

            }, ConflictError);

        });

    }).timeout(MAX_TIMEOUT);

    it("should delete a registered command and emit registered-command-deleted", () => {

        const command = {
            "command": {
                "binary": process.execPath
            },
            "name": "hello"
        };

        let emitted = null;

        return mediator.registerCommand({}, command).then(() => {

            mediator.once("registered-command-deleted", (payload) => {

                emitted = payload;

            });

            return mediator.deleteRegisteredCommand({}, {
                "name": "hello"
            });

        }).then(() => {

            deepStrictEqual(emitted, {
                "name": "hello"
            });

            return mediator.getRegisteredCommands();

        }).then((commands) => {

            deepStrictEqual(commands, []);

        });

    }).timeout(MAX_TIMEOUT);

    it("should reject deleting an unknown command", () => {

        return rejects(() => {

            return mediator.deleteRegisteredCommand({}, {
                "name": "missing"
            });

        }, NotFoundError);

    }).timeout(MAX_TIMEOUT);

    it("should return no running command by default", () => {

        return mediator.getRunningCommands().then((commands) => {

            deepStrictEqual(commands, []);

        });

    }).timeout(MAX_TIMEOUT);

    it("should run a command with options and emit logs then ended", () => {

        const ended = waitForEvent(mediator, "running-command-ended");
        const log = waitForEvent(mediator, "running-command-log");
        const warning = waitForEvent(mediator, "running-command-warning");
        const running = waitForEvent(mediator, "running-command-running");

        return mediator.runCommand({}, {
            "command": {
                "arguments": [ "-e", "process.stdout.write('out'); process.stderr.write('err');" ],
                "binary": process.execPath,
                "detached": false,
                "environmentVariables": {
                    "MIA_COMMANDS_TEST": "1"
                },
                "timeout": 10000,
                "windowsHide": true,
                "workingDirectory": resourcesDir
            },
            "name": "echo"
        }).then((started) => {

            strictEqual("number" === typeof started.pid, true);
            strictEqual(started.name, "echo");

            return running.then((payload) => {

                strictEqual(payload.pid, started.pid);

                return mediator.getRunningCommands();

            }).then((commands) => {

                strictEqual(0 < commands.length, true);

                return Promise.all([
                    log,
                    warning,
                    ended
                ]);

            }).then((results) => {

                strictEqual(results[0].content.includes("out"), true);
                strictEqual(results[1].content.includes("err"), true);
                strictEqual(results[2].pid, started.pid);

                return mediator.getRunningCommands();

            }).then((commands) => {

                deepStrictEqual(commands, []);

            });

        });

    }).timeout(MAX_TIMEOUT);

    it("should skip empty working directory and missing optional spawn options", () => {

        const ended = waitForEvent(mediator, "running-command-ended");

        return mediator.runCommand({}, {
            "command": {
                "arguments": [ "-e", "process.exit(0)" ],
                "binary": process.execPath,
                "workingDirectory": "   "
            },
            "name": "plain"
        }).then(() => {

            return ended;

        });

    }).timeout(MAX_TIMEOUT);

    it("should emit running-command-failed when the command exits with an error", () => {

        const failed = waitForEvent(mediator, "running-command-failed");

        return mediator.runCommand({}, {
            "command": {
                "arguments": [ "-e", "process.exit(1)" ],
                "binary": process.execPath
            },
            "name": "fail"
        }).then((started) => {

            return failed.then((payload) => {

                strictEqual(payload.command.pid, started.pid);
                strictEqual("string" === typeof payload.error.code, true);

            });

        });

    }).timeout(MAX_TIMEOUT);

    it("should emit running-command-failed when the binary is missing", () => {

        const failed = waitForEvent(mediator, "running-command-failed");

        return mediator.runCommand({}, {
            "command": {
                "binary": "mia-commands-missing-binary-xyz"
            },
            "name": "missing"
        }).then(() => {

            return failed.then((payload) => {

                strictEqual(payload.error.code, "UNKNOWN");
                strictEqual("string" === typeof payload.error.message, true);

            });

        });

    }).timeout(MAX_TIMEOUT);

    it("should handle missing stdio, stderr after an error, and a command already removed", () => {

        const originalSpawn = childProcess.spawn;
        const child = new EventEmitter();
        child.pid = 4242;
        child.stdout = new EventEmitter();
        child.stderr = new EventEmitter();
        child.stdout.setEncoding = function setEncoding () {
            return child.stdout;
        };
        child.stderr.setEncoding = function setEncoding () {
            return child.stderr;
        };

        childProcess.spawn = function spawn () {
            return child;
        };

        const failed = waitForEvent(mediator, "running-command-failed");
        const warning = waitForEvent(mediator, "running-command-warning");

        return mediator.runCommand({}, {
            "command": {
                "binary": "fake"
            },
            "name": "fake"
        }).then((started) => {

            strictEqual(started.pid, 4242);

            child.emit("error", new Error("spawn error"));
            child.stderr.emit("data", "warn-1");
            child.stderr.emit("data", "warn-2");
            mediator._runningCommands.splice(0, mediator._runningCommands.length);
            child.emit("close", 1, "SIGTERM");

            return Promise.all([ failed, warning ]);

        }).then((results) => {

            childProcess.spawn = originalSpawn;
            strictEqual(results[0].error.code, "SIGTERM");
            strictEqual(results[0].error.message, "spawn error");
            strictEqual(results[1].content, "warn-1");

        }).catch((err) => {

            childProcess.spawn = originalSpawn;

            return Promise.reject(err);

        });

    }).timeout(MAX_TIMEOUT);

    it("should run a command without stdio streams", () => {

        const originalSpawn = childProcess.spawn;
        const child = new EventEmitter();
        child.pid = 4243;

        childProcess.spawn = function spawn () {
            return child;
        };

        const ended = waitForEvent(mediator, "running-command-ended");

        return mediator.runCommand({}, {
            "command": {
                "binary": "fake"
            },
            "name": "nostdio"
        }).then(() => {

            child.emit("close", 0, null);

            return ended;

        }).then(() => {

            childProcess.spawn = originalSpawn;

        }).catch((err) => {

            childProcess.spawn = originalSpawn;

            return Promise.reject(err);

        });

    }).timeout(MAX_TIMEOUT);

    it("should reject stopping an unknown running command", () => {

        try {

            mediator.stopRunningCommand({}, {
                "name": "missing",
                "pid": 1
            });

            throw new Error("Should have thrown");

        }
        catch (err) {

            strictEqual(err instanceof NotFoundError, true);

        }

    }).timeout(MAX_TIMEOUT);

    it("should stop a running command on win32", () => {

        Object.defineProperty(process, "platform", {
            "configurable": true,
            "value": "win32"
        });

        const ended = waitForEvent(mediator, "running-command-ended");

        return mediator.runCommand({}, {
            "command": {
                "arguments": [ "-e", "setTimeout(function () {}, 30000)" ],
                "binary": process.execPath
            },
            "name": "sleep"
        }).then((started) => {

            return mediator.stopRunningCommand({}, {
                "name": "sleep",
                "pid": started.pid
            }).then(() => {

                return ended;

            });

        });

    }).timeout(MAX_TIMEOUT);

    it("should resolve with the error when win32 stop fails", () => {

        Object.defineProperty(process, "platform", {
            "configurable": true,
            "value": "win32"
        });

        return mediator.runCommand({}, {
            "command": {
                "arguments": [ "-e", "setTimeout(function () {}, 30000)" ],
                "binary": process.execPath
            },
            "name": "sleep"
        }).then((started) => {

            childProcess.exec = function exec (command, options, callback) {

                return callback(new Error("taskkill failed"), "");

            };

            return mediator.stopRunningCommand({}, {
                "name": "sleep",
                "pid": started.pid
            }).then((result) => {

                childProcess.exec = originalExec;

                strictEqual(result instanceof Error, true);
                strictEqual(result.message, "taskkill failed");

                return killPid(started.pid);

            }).catch((err) => {

                childProcess.exec = originalExec;

                return killPid(started.pid).then(() => {

                    return Promise.reject(err);

                });

            });

        });

    }).timeout(MAX_TIMEOUT);

    it("should stop a running command with SIGTERM outside win32", () => {

        Object.defineProperty(process, "platform", {
            "configurable": true,
            "value": "linux"
        });

        const ended = waitForEvent(mediator, "running-command-ended");

        return mediator.runCommand({}, {
            "command": {
                "arguments": [ "-e", "setTimeout(function () {}, 30000)" ],
                "binary": process.execPath
            },
            "name": "sleep"
        }).then((started) => {

            return mediator.stopRunningCommand({}, {
                "name": "sleep",
                "pid": started.pid
            }).then((result) => {

                strictEqual(result, "ok");

                return ended;

            });

        });

    }).timeout(MAX_TIMEOUT);

    it("should resolve with the error when SIGTERM throws an Error", () => {

        Object.defineProperty(process, "platform", {
            "configurable": true,
            "value": "linux"
        });

        return mediator.runCommand({}, {
            "command": {
                "arguments": [ "-e", "setTimeout(function () {}, 30000)" ],
                "binary": process.execPath
            },
            "name": "sleep"
        }).then((started) => {

            process.kill = function kill () {

                throw new Error("kill failed");

            };

            return mediator.stopRunningCommand({}, {
                "name": "sleep",
                "pid": started.pid
            }).then((result) => {

                process.kill = originalKill;

                strictEqual(result instanceof Error, true);
                strictEqual(result.message, "kill failed");

                return killPid(started.pid);

            });

        });

    }).timeout(MAX_TIMEOUT);

    it("should resolve with the error when SIGTERM throws a non-Error", () => {

        Object.defineProperty(process, "platform", {
            "configurable": true,
            "value": "linux"
        });

        return mediator.runCommand({}, {
            "command": {
                "arguments": [ "-e", "setTimeout(function () {}, 30000)" ],
                "binary": process.execPath
            },
            "name": "sleep"
        }).then((started) => {

            process.kill = function kill () {

                // eslint-disable-next-line no-throw-literal
                throw "kill failed";

            };

            return mediator.stopRunningCommand({}, {
                "name": "sleep",
                "pid": started.pid
            }).then((result) => {

                process.kill = originalKill;

                strictEqual(result instanceof Error, true);
                strictEqual(result.message, "kill failed");

                return killPid(started.pid);

            });

        });

    }).timeout(MAX_TIMEOUT);

});
