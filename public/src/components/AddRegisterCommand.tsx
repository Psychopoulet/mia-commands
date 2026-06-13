// deps

    // externals
    import React from "react";
    import {
        Modal, ModalBody, ModalFooter,
        InputTextLabel, InputIntegerLabel, CheckBoxLabel,
        Button
    } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "../SDK";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { SDK } from "../SDK";
    import type { components } from "../Descriptor";

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

    private readonly _handleChangeAddRegisteredCommandName = (e: React.ChangeEvent<HTMLInputElement>, value: string): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "addRegisteredCommand": {
                ...this.state.addRegisteredCommand,
                "name": value
            }
        });

    };

    private readonly _handleChangeAddRegisteredCommandBinary = (e: React.ChangeEvent<HTMLInputElement>, value: string): void => {

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

    private readonly _handleChangeAddRegisteredCommandWorkingDirectory = (e: React.ChangeEvent<HTMLInputElement>, value: string): void => {

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

    private readonly _handleChangeAddRegisteredCommandDetached = (e: React.ChangeEvent<HTMLInputElement>, value: boolean): void => {

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

    private readonly _handleChangeAddRegisteredCommandWindowsHide = (e: React.ChangeEvent<HTMLInputElement>, value: boolean): void => {

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

    private readonly _handleChangeAddRegisteredCommandTimeout = (e: React.ChangeEvent<HTMLInputElement>, value: number): void => {

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

        // @TODO : arguments
        // @TODO : environment

        return <Modal appId="{{plugin.name}}-app" title="Add Registered Command" centered
            onClose={ this.props.onClose }
            onSubmit={ this._handleSubmitAddRegisteredCommand }
        >

            <ModalBody>

                <InputTextLabel label="Name" disabled={ this.state.running }
                    value={ this.state.addRegisteredCommand.name } onChange={ this._handleChangeAddRegisteredCommandName }
                />

                <InputTextLabel label="Binary" disabled={ this.state.running }
                    value={ this.state.addRegisteredCommand.command.binary } onChange={ this._handleChangeAddRegisteredCommandBinary }
                />

                <InputTextLabel label="Arguments" disabled={ this.state.running }
                    value={ this.state.addRegisteredCommand.command.arguments?.join(", ") }
                />

                <InputTextLabel label="Working directory" disabled={ this.state.running }
                    value={ this.state.addRegisteredCommand.command.workingDirectory } onChange={ this._handleChangeAddRegisteredCommandWorkingDirectory }
                />

                <InputTextLabel label="Environment variables" disabled={ this.state.running } />

                <CheckBoxLabel label="Detached" disabled={ this.state.running }
                    checked={ this.state.addRegisteredCommand.command.detached } onToogle={ this._handleChangeAddRegisteredCommandDetached }
                />

                <CheckBoxLabel label="Windows hide" disabled={ this.state.running }
                    checked={ this.state.addRegisteredCommand.command.windowsHide } onToogle={ this._handleChangeAddRegisteredCommandWindowsHide }
                />

                <InputIntegerLabel label="Timeout" disabled={ this.state.running }
                    value={ this.state.addRegisteredCommand.command.timeout ?? 0 } onChange={ this._handleChangeAddRegisteredCommandTimeout }
                />

            </ModalBody>

            <ModalFooter>

                <Button type="submit" icon="save" variant="success" block disabled={ this.state.running }>
                    Add
                </Button>

            </ModalFooter>

        </Modal>;

    }

}
