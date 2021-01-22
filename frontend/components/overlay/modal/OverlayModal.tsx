import * as React from 'react'
import { useState } from 'react'
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, ButtonGroup, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

export default function OverlayModal(props: ModalProps) {
    const [open, setOpen] = useState(false);

    const toggle = () => setOpen(!open);

    return (
        <div>
            <div className={props.className} onClick={toggle}>
                {renderButton("Click", props.buttonLabel, props.icon)}
            </div>

            <Modal isOpen={open} toggle={toggle}>
                <ModalHeader toggle={toggle}>{props.title}</ModalHeader>
                <ModalBody>
                    {props.children}
                </ModalBody>
                <ModalFooter>
                    <ButtonGroup>
                        <Button color="primary" onClick={() => {
                            toggle()
                            props.onSubmit()
                        }}>
                            {renderButton("Ok", props.submitText, props.iconSubmit)}
                        </Button>
                        <Button color="secondary" onClick={toggle}>
                            {renderButton("Cancel", props.cancelText, props.iconCancel)}
                        </Button>
                    </ButtonGroup>
                </ModalFooter>
            </Modal>
        </div>
    )
}

function renderButton(defaultButtonText: string, buttonText?: string, icon?: IconProp) {
    if (!icon) {
        return buttonText || defaultButtonText;
    }

    return <div>
        <FontAwesomeIcon icon={icon}/>
        <span className={"d-none d-lg-block float-right pl-1"}>{buttonText || defaultButtonText}</span>
    </div>
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
    children: JSX.Element | JSX.Element[]
}
