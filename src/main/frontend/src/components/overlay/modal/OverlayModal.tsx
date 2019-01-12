import * as React from 'react'
import {IconProp} from "@fortawesome/fontawesome-svg-core"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {Button, Modal, ModalHeader, ModalBody, ModalFooter, ButtonGroup} from 'reactstrap'

class OverlayModal extends React.Component<ModalProps, ModalStats> {
    public constructor(props: ModalProps) {
        super(props)
        this.state = {modal: false}

        this.toggle = this.toggle.bind(this)
    }

    public render() {
        return (
            <div>
                <div className={this.props.className} onClick={this.toggle}>{
                    this.props.icon ? <div><FontAwesomeIcon icon={this.props.icon}/><span className={"d-none d-lg-block float-right pl-1"}>{this.props.buttonLabel}</span></div> :
                        this.props.buttonLabel
                }</div>

                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle}>{this.props.title}</ModalHeader>
                    <ModalBody>
                        {this.props.children}
                    </ModalBody>
                    <ModalFooter>
                        <ButtonGroup>
                            <Button color="primary" onClick={() => {
                                this.toggle()
                                this.props.onSubmit()
                            }}>
                                {this.props.iconSubmit ?
                                    <div><FontAwesomeIcon icon={this.props.iconSubmit}/>
                                        <span className={"d-none d-lg-block float-right pl-1"}>{this.props.submitText || "Ok"}</span>
                                    </div> : this.props.submitText || "Ok"
                                }
                            </Button>
                            <Button color="secondary" onClick={this.toggle}>
                                {this.props.iconCancel ?
                                    <div><FontAwesomeIcon icon={this.props.iconCancel}/>
                                        <span className={"d-none d-lg-block float-right pl-1"}>{this.props.cancelText || "Cancel"}</span>
                                    </div> :
                                    this.props.cancelText || "Cancel"
                                }
                            </Button>
                        </ButtonGroup>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }

    private toggle() {
        this.setState({modal: !this.state.modal})
    }

}

interface ModalProps {
    title: string
    icon?: IconProp
    iconCancel?: IconProp
    iconSubmit?: IconProp
    className?: string
    buttonLabel: string
    cancelText?: string
    submitText?: string
    onSubmit: () => void
}

interface ModalStats {
    modal: boolean
}

export default OverlayModal