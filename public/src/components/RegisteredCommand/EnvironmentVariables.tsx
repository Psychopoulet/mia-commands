// deps

    // externals
    import React from "react";
    import {
        Modal, ModalBody, ModalFooter,
        InputText, InputReadOnlyLabel,
        Button
    } from "react-bootstrap-fontawesome";

// types & interfaces

    // externals
    import type { iPropsInput } from "react-bootstrap-fontawesome";

    // locals
    import type { components } from "../../Descriptor";

    interface iProps extends iPropsInput {
        "label": string;
        "environmentVariables": components["schemas"]["Command"]["environmentVariables"];
        "onSave": (values: components["schemas"]["Command"]["environmentVariables"]) => void;
    }

    interface iState {
        "environmentVariables": components["schemas"]["Command"]["environmentVariables"];
        "environmentVariablesString": string;
        "openEnvironmentObject": boolean;
    }

// component

export default class EnvironmentVariables extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "EnvironmentVariables";

    // constructor

    public constructor (props: iProps) {

        super(props);

        // state

        this.state = {
            "environmentVariables": this.props.environmentVariables,
            "environmentVariablesString": JSON.stringify(this.props.environmentVariables ?? {}),
            "openEnvironmentObject": false
        };

    }

    // interface handlers

    private readonly _handleSubmitModal = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        try {

            const environmentVariables: components["schemas"]["Command"]["environmentVariables"] = JSON.parse(this.state.environmentVariablesString) as components["schemas"]["Command"]["environmentVariables"];

            this.setState({
                "openEnvironmentObject": false,
                "environmentVariables": environmentVariables
            });

            this.props.onSave(environmentVariables);

        }
        catch (err: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
            // nothing to do here
        }

    };

    private readonly _handleChangeEnvironmentVariablesString = (e: React.ChangeEvent<HTMLInputElement>, value: string): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "environmentVariablesString": value
        });

    };

    private readonly _handleOpenArgumentsObject = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "openEnvironmentObject": true
        });

    };

    private readonly _handleCloseArgumentsObject = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "openEnvironmentObject": false
        });

    };

    // render

    public render (): React.JSX.Element {

        return <>

            { this.state.openEnvironmentObject && <Modal appId="{{plugin.name}}-app" title="Environment variables" centered
                onClose={ this._handleCloseArgumentsObject }
                onSubmit={ this._handleSubmitModal }
            >

                <ModalBody>

                    <InputText disabled={ this.props.disabled }
                        value={ this.state.environmentVariablesString } onChange={ this._handleChangeEnvironmentVariablesString }
                    />

                </ModalBody>

                <ModalFooter>

                    <Button type="submit"
                        icon="save" variant="info" block
                        disabled={ this.props.disabled }
                    >
                        Save
                    </Button>

                </ModalFooter>

            </Modal> }

            <InputReadOnlyLabel id={ this.props.id } name={ this.props.name } label={ this.props.label } disabled={ this.props.disabled }
                value={ JSON.stringify(this.state.environmentVariables) }
            >

                <Button icon="cog" variant="info" outline disabled={ this.props.disabled }
                    onClick={ this._handleOpenArgumentsObject }
                />

            </InputReadOnlyLabel>

        </>;

    }

}
