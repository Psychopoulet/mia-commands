// deps

    // externals
    import React from "react";
    import {
        Modal, ModalBody, ModalFooter,
        InputTextLabel, InputArray,
        Button
    } from "react-bootstrap-fontawesome";

// types & interfaces

    // externals
    import type { iPropsInput } from "react-bootstrap-fontawesome";

    // locals
    import type { components } from "../Descriptor";

    interface iProps extends iPropsInput {
        "label": string;
        "arguments": components["schemas"]["Command"]["arguments"];
        "onSave": (values: string[]) => void;
    }

    interface iState {
        "arguments": string[];
        "openArgumentsArray": boolean;
    }

// component

export default class Arguments extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "Arguments";

    // constructor

    public constructor (props: iProps) {

        super(props);

        // state

        this.state = {
            "arguments": this.props.arguments ?? [],
            "openArgumentsArray": false
        };

    }

    // interface handlers

    private readonly _handleSubmitModal = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "openArgumentsArray": false
        });

        this.props.onSave(this.state.arguments);

    };

    private readonly _handleChangeArgumentsString = (e: React.ChangeEvent<HTMLInputElement>, value: string): void => {

        e.preventDefault();
        e.stopPropagation();

        const values: string[] = value.split(" ");

        this.setState({
            "arguments": values
        });

        this.props.onSave(values);

    };

    private readonly _handleChangeArgumentsArray = (e: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>, newValue: string[]): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "arguments": newValue
        });

    };

    private readonly _handleOpenArgumentsArray = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "openArgumentsArray": true
        });

    };

    private readonly _handleCloseArgumentsArray = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "openArgumentsArray": false
        });

    };

    // render

    public render (): React.JSX.Element {

        return <>

            { this.state.openArgumentsArray && <Modal appId="{{plugin.name}}-app" title="Arguments" centered
                onClose={ this._handleCloseArgumentsArray }
                onSubmit={ this._handleSubmitModal }
            >

                <ModalBody>

                    <InputArray disabled={ this.props.disabled }
                        value={ this.state.arguments } onChange={ this._handleChangeArgumentsArray }
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

            <InputTextLabel id={ this.props.id } name={ this.props.name } label={ this.props.label } disabled={ this.props.disabled }
                value={ this.state.arguments.join(" ") } onChange={ this._handleChangeArgumentsString }
            >

                <Button icon="cog" variant="info" outline disabled={ this.props.disabled }
                    onClick={ this._handleOpenArgumentsArray }
                />

            </InputTextLabel>

        </>;

    }

}
