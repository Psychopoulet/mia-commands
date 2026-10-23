// deps

    // natives
    const { strictEqual } = require("node:assert");
    const { mkdtemp, readFile, rm, writeFile } = require("node:fs/promises");
    const { tmpdir } = require("node:os");
    const { join } = require("node:path");

    // locals
    const main = require(join(__dirname, "..", "lib", "src", "main.cts"));
    const Orchestrator = require(join(__dirname, "..", "lib", "src", "Orchestrator.ts")).default;
    const descriptor = require(join(__dirname, "..", "lib", "src", "Descriptor.ts"));

// tests

describe("orchestrator", () => {

    it("should export the orchestrator", () => {

        strictEqual(main, Orchestrator, "main export is not the orchestrator");
        strictEqual(typeof descriptor, "object", "descriptor types must load");

    });

    it("should install and uninstall registered commands", () => {

        let root = "";

        return mkdtemp(join(tmpdir(), "mia-commands-")).then((created) => {

            root = created;

            const resources = join(created, "resources");
            const commandsFile = join(resources, "registeredCommands.json");
            const orchestrator = new Orchestrator({
                "externalResourcesDirectory": resources
            });

            return orchestrator._initWorkSpace().then(() => {

                return readFile(commandsFile, "utf-8");

            }).then((content) => {

                strictEqual(content, "[]", "registered commands must start empty");

                return writeFile(commandsFile, "[{\"name\":\"kept\"}]", "utf-8");

            }).then(() => {

                return orchestrator.install();

            }).then(() => {

                return readFile(commandsFile, "utf-8");

            }).then((content) => {

                strictEqual(content, "[{\"name\":\"kept\"}]", "existing commands must be kept");

                return orchestrator.uninstall();

            }).then(() => {

                return orchestrator.uninstall();

            });

        }).finally(() => {

            return root ? rm(root, {
                "recursive": true,
                "force": true
            }) : Promise.resolve();

        });

    });

});
