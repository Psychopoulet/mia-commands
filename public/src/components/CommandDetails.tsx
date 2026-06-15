// deps

    // externals
    import React from "react";
    import {
        Modal, ModalList,
        ListItem
    } from "react-bootstrap-fontawesome";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { components } from "../Descriptor";

    interface iProps extends iPropsNode {
        "command": components["schemas"]["RegisteredCommand"] | components["schemas"]["RunningCommand"];
        "onClose": (e: React.MouseEvent<HTMLButtonElement>) => void;
    }

// component

export default class CommandDetails extends React.Component<iProps> {

    // name

        public static displayName: string = "CommandDetails";

    // render

    public render (): React.JSX.Element {

        console.log(this.props.command);

        return <Modal appId="{{plugin.name}}-app" title={ this.props.command.name + " command details" }
            variant="info" centered
            onClose={ this.props.onClose }
        >

            <ModalList>

                <ListItem variant="secondary">
                    <strong>{ this.props.command.command.binary }</strong> { this.props.command.command.arguments?.join(" ") }
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

                { "number" === typeof (this.props.command as components["schemas"]["RunningCommand"]).pid && <ListItem justify>
                    <span>PID</span> { (this.props.command as components["schemas"]["RunningCommand"]).pid }
                </ListItem> }

                { "string" === typeof (this.props.command as components["schemas"]["RunningCommand"]).startedAt && <ListItem justify>
                    <span>Started at</span> { (this.props.command as components["schemas"]["RunningCommand"]).startedAt }
                </ListItem> }

            </ModalList>

        </Modal>;

    }

}
