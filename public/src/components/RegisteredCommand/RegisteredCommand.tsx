// deps

    // externals
    import React from "react";
    import {
        ListItem, ButtonGroup, Button
    } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "../../SDK";
    import CommandDetails from "../CommandDetails";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { SDK } from "../../SDK";
    import type { components } from "../../Descriptor";

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

            { this.state.detailsModalOpened && <CommandDetails command={ this.props.command } onClose={ this._handleCloseDetailsRegisteredCommand } /> }

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
