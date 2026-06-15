// deps

    // externals
    import React from "react";
    import {
        Modal, ModalBody, ModalFooter,
        InputTextLabel, InputIntegerLabel, CheckBoxLabel,
        Button
    } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "../../SDK";
    import Arguments from "./Arguments";
    import EnvironmentVariables from "./EnvironmentVariables";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { SDK } from "../../SDK";
    import type { components } from "../../Descriptor";

    interface iProps extends iPropsNode {
        "onClose": (e?: React.MouseEvent<HTMLButtonElement>) => void;
        "onError": (err: Error) => void;
    }

    interface iState {
        "running": boolean;
        "addRegisteredCommand": components["schemas"]["RegisteredCommand"];
    }

// component

export default class AddRegisterCommand extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "AddRegisterCommand";

    // private

        private readonly _sdk: SDK = getSDK();

    // constructor

    public constructor (props: iProps) {

        super(props);

        // state

        this.state = {
            "running": false,
            "addRegisteredCommand": {
                "name": "",
                "command": {
                    "binary": ""
                }
            }
        };

    }

    // interface handlers

    private readonly _handleChangeAddRegisteredCommandName = (e: React.ChangeEvent<HTMLInputElement>, value: components["schemas"]["RegisteredCommand"]["name"]): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "addRegisteredCommand": {
                ...this.state.addRegisteredCommand,
                "name": value
            }
        });

    };

    private readonly _handleChangeAddRegisteredCommandBinary = (e: React.ChangeEvent<HTMLInputElement>, value: components["schemas"]["Command"]["binary"]): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "addRegisteredCommand": {
                ...this.state.addRegisteredCommand,
                "command": {
                    ...this.state.addRegisteredCommand.command,
                    "binary": value
                }
            }
        });

    };

    private readonly _handleChangeAddRegisteredCommandArguments = (values: components["schemas"]["Command"]["arguments"]): void => {

        this.setState({
            "addRegisteredCommand": {
                ...this.state.addRegisteredCommand,
                "command": {
                    ...this.state.addRegisteredCommand.command,
                    "arguments": values
                }
            }
        });

    };

    private readonly _handleChangeAddRegisteredCommandWorkingDirectory = (e: React.ChangeEvent<HTMLInputElement>, value: components["schemas"]["Command"]["workingDirectory"]): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "addRegisteredCommand": {
                ...this.state.addRegisteredCommand,
                "command": {
                    ...this.state.addRegisteredCommand.command,
                    "workingDirectory": value
                }
            }
        });

    };

    private readonly _handleChangeAddRegisteredCommandEnvironmentVariables = (values: components["schemas"]["Command"]["environmentVariables"]): void => {

        this.setState({
            "addRegisteredCommand": {
                ...this.state.addRegisteredCommand,
                "command": {
                    ...this.state.addRegisteredCommand.command,
                    "environmentVariables": values
                }
            }
        });

    };

    private readonly _handleChangeAddRegisteredCommandDetached = (e: React.ChangeEvent<HTMLInputElement>, value: components["schemas"]["Command"]["detached"]): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "addRegisteredCommand": {
                ...this.state.addRegisteredCommand,
                "command": {
                    ...this.state.addRegisteredCommand.command,
                    "detached": value
                }
            }
        });

    };

    private readonly _handleChangeAddRegisteredCommandWindowsHide = (e: React.ChangeEvent<HTMLInputElement>, value: components["schemas"]["Command"]["windowsHide"]): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "addRegisteredCommand": {
                ...this.state.addRegisteredCommand,
                "command": {
                    ...this.state.addRegisteredCommand.command,
                    "windowsHide": value
                }
            }
        });

    };

    private readonly _handleChangeAddRegisteredCommandTimeout = (e: React.ChangeEvent<HTMLInputElement>, value: components["schemas"]["Command"]["timeout"]): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "addRegisteredCommand": {
                ...this.state.addRegisteredCommand,
                "command": {
                    ...this.state.addRegisteredCommand.command,
                    "timeout": value
                }
            }
        });

    };

    private readonly _handleSubmitAddRegisteredCommand = (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        const command: components["schemas"]["RegisteredCommand"] = {
            "name": this.state.addRegisteredCommand.name,
            "command": {
                "binary": this.state.addRegisteredCommand.command.binary
            }
        };

        if (Array.isArray(this.state.addRegisteredCommand.command.arguments) && 0 < this.state.addRegisteredCommand.command.arguments.length) {
            command.command.arguments = this.state.addRegisteredCommand.command.arguments;
        }

        if ("string" === typeof this.state.addRegisteredCommand.command.workingDirectory && 0 < this.state.addRegisteredCommand.command.workingDirectory.trim().length) {
            command.command.workingDirectory = this.state.addRegisteredCommand.command.workingDirectory.trim();
        }

        if ("undefined" !== typeof this.state.addRegisteredCommand.command.environmentVariables && 0 < Object.keys(this.state.addRegisteredCommand.command.environmentVariables).length) {
            command.command.environmentVariables = this.state.addRegisteredCommand.command.environmentVariables;
        }

        if ("boolean" === typeof this.state.addRegisteredCommand.command.detached) {
            command.command.detached = this.state.addRegisteredCommand.command.detached;
        }

        if ("boolean" === typeof this.state.addRegisteredCommand.command.windowsHide) {
            command.command.windowsHide = this.state.addRegisteredCommand.command.windowsHide;
        }

        if ("number" === typeof this.state.addRegisteredCommand.command.timeout && 0 < this.state.addRegisteredCommand.command.timeout) {
            command.command.timeout = this.state.addRegisteredCommand.command.timeout;
        }

        this.setState({
            "running": true
        });

        this._sdk.registerCommand(command).then((): void => {

            this.setState({
                "running": false
            });

            this.props.onClose();

        }).catch((err: Error): void => {

            this.props.onError(err);

            this.setState({
                "running": false
            });

        });

    };

    // render

    public render (): React.JSX.Element {

        return <Modal appId="{{plugin.name}}-app" title="Add Registered Command" centered
            onClose={ this.props.onClose }
            onSubmit={ this._handleSubmitAddRegisteredCommand }
        >

            <ModalBody>

                <InputTextLabel id="add-registered-command-name" label="Name" disabled={ this.state.running }
                    value={ this.state.addRegisteredCommand.name } onChange={ this._handleChangeAddRegisteredCommandName }
                />

                <InputTextLabel id="add-registered-command-binary" label="Binary" disabled={ this.state.running }
                    value={ this.state.addRegisteredCommand.command.binary } onChange={ this._handleChangeAddRegisteredCommandBinary }
                />

                <Arguments id="add-registered-command-arguments" label="Arguments" disabled={ this.state.running }
                    arguments={ this.state.addRegisteredCommand.command.arguments } onSave={ this._handleChangeAddRegisteredCommandArguments }
                />

                <InputTextLabel id="add-registered-command-workingDirectory" label="Working directory" disabled={ this.state.running }
                    value={ this.state.addRegisteredCommand.command.workingDirectory } onChange={ this._handleChangeAddRegisteredCommandWorkingDirectory }
                />

                <EnvironmentVariables id="add-registered-command-environmentVariables" label="Environment variables" disabled={ this.state.running }
                    environmentVariables={ this.state.addRegisteredCommand.command.environmentVariables } onSave={ this._handleChangeAddRegisteredCommandEnvironmentVariables }
                />

                <CheckBoxLabel id="add-registered-command-detached" label="Detached" disabled={ this.state.running }
                    checked={ this.state.addRegisteredCommand.command.detached } onToogle={ this._handleChangeAddRegisteredCommandDetached }
                />

                <CheckBoxLabel id="add-registered-command-windowsHide" label="Windows hide" disabled={ this.state.running }
                    checked={ this.state.addRegisteredCommand.command.windowsHide } onToogle={ this._handleChangeAddRegisteredCommandWindowsHide }
                />

                <InputIntegerLabel id="add-registered-command-timeout" label="Timeout" disabled={ this.state.running }
                    value={ this.state.addRegisteredCommand.command.timeout ?? 0 } onChange={ this._handleChangeAddRegisteredCommandTimeout }
                />

            </ModalBody>

            <ModalFooter>

                <Button type="submit"
                    icon="save" variant="success" block
                    disabled={ this.state.running }
                >
                    Add
                </Button>

            </ModalFooter>

        </Modal>;

    }

}
