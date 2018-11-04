import * as React from 'react';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';

class OverlayModal extends React.Component<ModalProps, ModalStats> {
    public constructor(props: ModalProps) {
        super(props);
        this.state = {
            modal: false
        };

        this.toggle = this.toggle.bind(this);
    }

    public render() {
        return (
            <div>
                <div className={this.props.className} onClick={this.toggle}>{this.props.buttonLabel}</div>

                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle}>{this.props.title}</ModalHeader>
                    <ModalBody>
                        {this.props.children}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => {
                            this.toggle()
                            this.props.onSubmit()
                        }}>{this.props.submitText || "Ok"}</Button>{' '}
                        <Button color="secondary" onClick={this.toggle}>{this.props.cancelText || "Cancel"}</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }

    private toggle() {
        this.setState({
            modal: !this.state.modal
        });
    }

}

interface ModalProps {
    title: string
    buttonLabel: string
    className?: string
    cancelText?: string
    submitText?: string
    onSubmit: () => void
}

interface ModalStats {
    modal: boolean
}

export default OverlayModal;