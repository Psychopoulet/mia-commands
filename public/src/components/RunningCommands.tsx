// deps

    // externals
    import React from "react";
    import {
        Card, CardHeader, CardBody
    } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "../SDK";
    import RunningCommand from "./RunningCommand/RunningCommand";

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
        "runningcommands": Array<components["schemas"]["RunningCommand"]>;
    }

// component

export default class RunningCommands extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "RunningCommands";

    // private

        private readonly _sdk: SDK = getSDK();

    // constructor

    public constructor (props: iProps) {

        super(props);

        // state

        this.state = {
            "loading": true,
            "runningcommands": []
        };

    }

    public componentDidMount (): void {

        this._sdk
            .on("running-command-running", this._onRunningCommandRunning)
            .on("running-command-ended", this._onRunningCommandEnded)
            .on("running-command-failed", this._onRunningCommandFailed);

        this._sdk.getRunningCommands().then((runningcommands: Array<components["schemas"]["RunningCommand"]>): void => {

            this.setState({
                "loading": false,
                "runningcommands": runningcommands
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
            .off("running-command-running", this._onRunningCommandRunning)
            .off("running-command-ended", this._onRunningCommandEnded)
            .off("running-command-failed", this._onRunningCommandFailed);

    }

    // sdk events

    private readonly _onRunningCommandRunning = (data: components["schemas"]["PushEventRunningCommandRunning"]["data"]): void => {

        this.setState({
            "runningcommands": [ ...this.state.runningcommands, data ]
        });

    };

    private readonly _onRunningCommandEnded = (data: components["schemas"]["PushEventRunningCommandEnded"]["data"]): void => {

        this.setState({
            "runningcommands": this.state.runningcommands.filter((command: components["schemas"]["RunningCommand"]): boolean => {
                return command.pid !== data.pid;
            })
        });

    };

    private readonly _onRunningCommandFailed = (data: components["schemas"]["PushEventRunningCommandFailed"]["data"]): void => {

        this.setState({
            "runningcommands": this.state.runningcommands.filter((command: components["schemas"]["RunningCommand"]): boolean => {
                return command.pid !== data.command.pid;
            })
        });

        this.props.onError(new Error(data.error.message));

    };

    // render

    private readonly _renderRunningCommands = (): React.JSX.Element[] | React.JSX.Element => {

        if (this.state.loading) {
            return <div className="text-warning">Loading...</div>;
        }

        if (0 >= this.state.runningcommands.length) {
            return <div>No running commands</div>;
        }

        return <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">

            { this.state.runningcommands.map((command: components["schemas"]["RunningCommand"]): React.JSX.Element => {

                return <div className="col">
                    <RunningCommand key={ command.pid } command={ command } onError={ this.props.onError } />
                </div>;

            }) }

        </div>;

    };

    public render (): React.JSX.Element {

        return <Card>

            <CardHeader>Running Commands</CardHeader>

            <CardBody>

                { this._renderRunningCommands() }

            </CardBody>

        </Card>;

    }

}
