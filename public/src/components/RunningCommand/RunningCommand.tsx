// deps

    // externals
    import React from "react";
    import {
        Card, CardHeader, CardList,
        ListItem,
        ButtonGroup, Button
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

    interface iLog {
        "type": "log" | "warning";
        "content": components["schemas"]["PushEventRunningCommandLog"]["data"]["content"];
    }

    interface iProps extends iPropsNode {
        "command": components["schemas"]["RunningCommand"];
        "onError": (err: Error) => void;
    }

    interface iState {
        "running": boolean;
        "logs": iLog[];
        "detailsModalOpened": boolean;
    }

// component

export default class RunningCommand extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "RunningCommand";

    // private

        private readonly _sdk: SDK = getSDK();

    // constructor

    public constructor (props: iProps) {

        super(props);

        // state

        this.state = {
            "running": false,
            "logs": [],
            "detailsModalOpened": false
        };

    }

    public componentDidMount (): void {

        this._sdk
            .on("running-command-log", this._onRunningCommandLog)
            .on("running-command-warning", this._onRunningCommandWarning);

    }

    public componentWillUnmount (): void {

        this._sdk
            .off("running-command-log", this._onRunningCommandLog)
            .off("running-command-warning", this._onRunningCommandWarning);

    }

    // sdk events

    private readonly _onRunningCommandLog = (data: components["schemas"]["PushEventRunningCommandLog"]["data"]): void => {

        if (this.props.command.pid === data.command.pid) {

            this.setState({
                "logs": [ ...this.state.logs, { "type": "log", "content": data.content } ]
            });

        }

    };

    private readonly _onRunningCommandWarning = (data: components["schemas"]["PushEventRunningCommandWarning"]["data"]): void => {

        if (this.props.command.pid === data.command.pid) {

            this.setState({
                "logs": [ ...this.state.logs, { "type": "warning", "content": data.content } ]
            });

        }

    };

    // interface handlers

    private readonly _handleStopRunningCommand = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "running": true
        });

        this._sdk.stopRunningCommand(this.props.command).then((): void => {

            this.setState({
                "running": false
            });

        }).catch((err: Error): void => {

            this.setState({
                "running": false
            });

            this.props.onError(err);

        });

    };

    private readonly _handleGetDetailsRunningCommand = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "detailsModalOpened": true
        });

    };

    private readonly _handleCloseDetailsRunningCommand = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "detailsModalOpened": false
        });

    };

    // render

    public render (): React.JSX.Element {

        return <>

            { this.state.detailsModalOpened && <CommandDetails command={ this.props.command } onClose={ this._handleCloseDetailsRunningCommand } /> }

            <Card>

                <CardHeader justify>

                    <span>{ this.props.command.name } ({ this.props.command.pid })</span>

                    <ButtonGroup>

                        <Button title="Get details"
                            icon="question" variant="info" outline size="sm"
                            onClick={ this._handleGetDetailsRunningCommand }
                        />

                        <Button title="Stop command"
                            icon="stop" variant="danger" size="sm"
                            onClick={ this._handleStopRunningCommand }
                        />

                    </ButtonGroup>

                </CardHeader>

                { 0 < this.state.logs.length && <CardList>

                    { this.state.logs.map((log: iLog, index: number): React.JSX.Element => {

                        return <ListItem key={ index } variant={ "log" === log.type ? undefined : "warning" }>
                            { log.content }
                        </ListItem>;

                    }) }

                </CardList> }

            </Card>

        </>;

    }

}
