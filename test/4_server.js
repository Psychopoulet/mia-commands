// deps

    // natives
    const { deepStrictEqual, strictEqual } = require("node:assert");
    const { EventEmitter } = require("node:events");
    const { join } = require("node:path");

    // locals
    const Server = require(join(__dirname, "..", "lib", "src", "Server.ts")).default;

// tests

describe("server", () => {

    it("should forward mediator events and stop after release", () => {

        const mediator = new EventEmitter();
        const pushes = [];
        const server = new Server({
            "externalResourcesDirectory": ""
        });

        server._Mediator = mediator;
        server.push = (command, data) => {

            pushes.push({
                "command": command,
                "data": data
            });

            return server;

        };

        return server._initWorkSpace().then(() => {

            const events = [
                {
                    "name": "initialized"
                },
                {
                    "name": "released"
                },
                {
                    "name": "error",
                    "data": {
                        "message": "boom"
                    }
                },
                {
                    "name": "registered-command-added",
                    "data": {
                        "name": "added"
                    }
                },
                {
                    "name": "registered-command-deleted",
                    "data": {
                        "name": "deleted"
                    }
                },
                {
                    "name": "running-command-running",
                    "data": {
                        "pid": 1
                    }
                },
                {
                    "name": "running-command-ended",
                    "data": {
                        "pid": 1
                    }
                },
                {
                    "name": "running-command-failed",
                    "data": {
                        "pid": 1
                    }
                },
                {
                    "name": "running-command-log",
                    "data": {
                        "message": "log"
                    }
                },
                {
                    "name": "running-command-warning",
                    "data": {
                        "message": "warn"
                    }
                }
            ];

            events.forEach((event) => {
                mediator.emit(event.name, event.data);
            });

            deepStrictEqual(pushes.map((item) => {
                return item.command;
            }), events.map((event) => {
                return event.name;
            }), "forwarded commands are not as expected");

            strictEqual(pushes[2].data.message, "boom", "error data is not as expected");

            return server._releaseWorkSpace();

        }).then(() => {

            const count = pushes.length;

            mediator.emit("initialized");
            strictEqual(pushes.length, count, "released server must ignore mediator events");

        });

    });

});
