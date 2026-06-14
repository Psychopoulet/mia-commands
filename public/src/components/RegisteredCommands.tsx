// deps

    // externals
    import React from "react";
    import {
        Card, CardHeader, CardList, CardFooter,
        ListItem,
        Button
    } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "../SDK";
    import AddRegisterCommand from "./AddRegisterCommand";
    import RegisteredCommand from "./RegisteredCommand";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { SDK } from "../SDK";
    import type { components } from "../Descriptor";

    interface iProps extends iPropsNode {
        "onError": (err: Error) => void;
    }

    interface iState {
        "loading": boolean;
        "registeredCommands": Array<components["schemas"]["RegisteredCommand"]>;
        "addRegisteredCommandModalOpened": boolean;
    }

// component

export default class RegisteredCommands extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "RegisteredCommands";

    // private

        private readonly _sdk: SDK = getSDK();

    // constructor

    public constructor (props: iProps) {

        super(props);

        // state

        this.state = {
            "loading": true,
            "registeredCommands": [],
            "addRegisteredCommandModalOpened": false
        };

    }

    public componentDidMount (): void {

        this._sdk
            .on("registered-command-added", this._onRegisteredCommandAdded)
            .on("registered-command-deleted", this._onRegisteredCommandDeleted);

        this._sdk.getRegisteredCommands().then((registeredCommands: Array<components["schemas"]["RegisteredCommand"]>): void => {

            this.setState({
                "loading": false,
                "registeredCommands": registeredCommands
            });

        }).catch((err: Error): void => {

            this.props.onError(err);

            this.setState({
                "loading": false
            });

        });

    }

    public componentWillUnmount (): void {

        this._sdk
            .off("registered-command-added", this._onRegisteredCommandAdded)
            .off("registered-command-deleted", this._onRegisteredCommandDeleted);

    }

    // sdk events

    private readonly _onRegisteredCommandAdded = (data: components["schemas"]["PushEventRegisteredCommandAdded"]["data"]): void => {

        this.setState({
            "registeredCommands": [ ...this.state.registeredCommands, data ]
        });

    };

    private readonly _onRegisteredCommandDeleted = (data: components["schemas"]["PushEventRegisteredCommandDeleted"]["data"]): void => {

        this.setState({
            "registeredCommands": this.state.registeredCommands.filter((command: components["schemas"]["RegisteredCommand"]): boolean => {
                return command.name !== data.name;
            })
        });

    };

    // interface handlers

    private readonly _handleAddRegisteredCommand = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "addRegisteredCommandModalOpened": true
        });

    };

    private readonly _handleCloseAddRegisteredCommandModal = (e?: React.MouseEvent<HTMLButtonElement>): void => {

        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        this.setState({
            "addRegisteredCommandModalOpened": false
        });

    };

    // render

    public render (): React.JSX.Element {

        return <>

            { this.state.addRegisteredCommandModalOpened && <AddRegisterCommand
                onClose={ this._handleCloseAddRegisteredCommandModal }
                onError={ this.props.onError }
            /> }

            <Card>

                <CardHeader>Registered Commands</CardHeader>

                <CardList>

                    { this.state.loading && <ListItem variant="warning">Loading...</ListItem> }
                    { !this.state.loading && 0 >= this.state.registeredCommands.length && <ListItem variant="warning">No registered commands</ListItem> }

                    { !this.state.loading && 0 < this.state.registeredCommands.length && this.state.registeredCommands.map((command: components["schemas"]["RegisteredCommand"]): React.JSX.Element => {

                        return <RegisteredCommand key={ command.name } command={ command }
                            onError={ this.props.onError }
                        />;

                    }) }

                </CardList>

                <CardFooter>

                    <Button icon="plus" variant="success" block
                        disabled={ this.state.loading }
                        onClick={ this._handleAddRegisteredCommand }
                    >
                        Add Registered Command
                    </Button>

                </CardFooter>

            </Card>

        </>;

    }

}
