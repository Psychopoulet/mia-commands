// deps

    // externals
    import React from "react";
    import {
        Modal, ModalList,
        ListItem, ButtonGroup, Button
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
        "command": components["schemas"]["RegisteredCommand"];
        "onError": (err: Error) => void;
    }

    interface iState {
        "detailsModalOpened": boolean;
    }

// component

export default class RegisteredCommand extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "RegisteredCommand";

    // private

        private readonly _sdk: SDK = getSDK();

    // constructor

    public constructor (props: iProps) {

        super(props);

        // state

        this.state = {
            "detailsModalOpened": false
        };

    }

    // interface handlers

    private readonly _handleRunRegisteredCommand = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        this._sdk.runCommand(this.props.command).catch((err: Error): void => {

            this.props.onError(err);

        });

    };

    private readonly _handleGetDetailsRegisteredCommand = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "detailsModalOpened": true
        });

    };

    private readonly _handleCloseDetailsRegisteredCommand = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "detailsModalOpened": false
        });

    };

    private readonly _handleDeleteRegisteredCommand = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        this._sdk.deleteRegisteredCommand(this.props.command).catch((err: Error): void => {

            this.props.onError(err);

        });

    };

    // render

    public render (): React.JSX.Element {

        return <>

            { this.state.detailsModalOpened && <Modal appId="{{plugin.name}}-app" title={ this.props.command.name + " command details" }
                variant="info" centered
                onClose={ this._handleCloseDetailsRegisteredCommand }
            >

                <ModalList>

                    <ListItem variant="secondary">
                        { this.props.command.command.binary } { this.props.command.command.arguments?.join(" ") }
                    </ListItem>

                    { "string" === typeof this.props.command.command.workingDirectory && <ListItem justify>
                        <span>Working directory</span> { this.props.command.command.workingDirectory }
                    </ListItem> }

                    { this.props.command.command.environmentVariables && <ListItem justify>

                        <span>Environment variables</span> <span>

                            {

                                Object.entries(this.props.command.command.environmentVariables).map(([ key, value ]: [string, string], index: number): React.JSX.Element => {

                                    return <>
                                        { 0 < index && <br /> }
                                        <span key={ key }>{ key } = { value }</span>
                                    </>;

                                })

                            }

                        </span>

                    </ListItem> }

                    { "boolean" === typeof this.props.command.command.detached && <ListItem justify>
                        <span>Detached</span> { this.props.command.command.detached ? "Yes" : "No" }
                    </ListItem> }

                    { "boolean" === typeof this.props.command.command.windowsHide && <ListItem justify>
                        <span>Windows hide</span> { this.props.command.command.windowsHide ? "Yes" : "No" }
                    </ListItem> }

                    { "number" === typeof this.props.command.command.timeout && <ListItem justify>
                        <span>Timeout</span> { this.props.command.command.timeout }
                    </ListItem> }

                </ModalList>

            </Modal> }

            <ListItem justify>

                { this.props.command.name } <ButtonGroup>

                    <Button title="Run command"
                        icon="play" variant="success" outline size="sm"
                        onClick={ this._handleRunRegisteredCommand }
                    />

                    <Button title="Get details"
                        icon="question" variant="info" outline size="sm"
                        onClick={ this._handleGetDetailsRegisteredCommand }
                    />

                    <Button title="Delete command"
                        icon="trash" variant="danger" outline size="sm"
                        onClick={ this._handleDeleteRegisteredCommand }
                    />

                </ButtonGroup>

            </ListItem>

        </>;

    }

}
