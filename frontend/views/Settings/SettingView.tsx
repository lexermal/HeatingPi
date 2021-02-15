import * as React from 'react'
import { useState } from 'react'
import { Col, Container, Form, FormGroup, FormText, Input, Label, Row } from 'reactstrap'
import { faPowerOff } from "@fortawesome/free-solid-svg-icons"
import { queryHandler } from '../BackendHandler/BackendHandler'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import PinTable, { Pin } from '../../components/pintable/PinTable'
import { APPLY_SETTINGS, EDIT_PIN, mutationHandler, SETTINGS } from '../../utils/backendCalls'
import LabelSwitch, { SwitchListType } from '../../components/label/switch/LabelSwitch'

export default function SettingView() {
    const editPin = mutationHandler(EDIT_PIN, "pin", {})

    return queryHandler(SETTINGS, (data) => {
        return <Container>
            <h1 className={"mt-4"}>Settings</h1>
            <h3 className={"mt-4"}>Pin default state</h3>
            <p>Define if the pins should be switched on when the application starts.</p>

            <PinTable
                pins={data.pins}
                iconRenderer={(pin: Pin) => renderIcon(pin, editPin)}
                labelOnSubmit={(pin: Pin, name: string) => {
                    editPin({
                        variables: {
                            id: pin.id,
                            name: name,
                            activeByDefault: pin.activeByDefault
                        }
                    })
                }}/>
            <SchemaSettings settings={data.settings}/>
        </Container>
    })
}

const iconSwitchList = [
    [<FontAwesomeIcon key={1} icon={faPowerOff} size={"lg"} className={"text-success"}/>, true, ""],
    [<FontAwesomeIcon key={1} icon={faPowerOff} size={"lg"} className={"text-danger"}/>, false]
] as SwitchListType;

function renderIcon(pin: Pin, editPin): JSX.Element {
    return <LabelSwitch
        instantSave={true}
        switchlist={iconSwitchList}
        defaultIndex={pin.activeByDefault ? 0 : 1}
        onChange={(active: boolean) => {
            editPin({
                variables: {
                    id: pin.id,
                    name: pin.name,
                    activeByDefault: active
                }
            })
        }}/>
}

function SchemaSettings(props: { settings: Settings }) {
    const [allowOne, setAllowOne] = useState(props.settings.oneSchemaMode);
    const [priority, setPriority] = useState(props.settings.multiSchemaPriority);
    const applySettings = mutationHandler(APPLY_SETTINGS, "settings", { edit: true });

    return <>
        <h1 className={"mt-4 mb-3"}>Schema settings</h1>
        <Row>
            <Col>
                <Form>
                    <FormGroup className={"pl-4"}>
                        <Label>
                            <Input type="checkbox" checked={allowOne} onChange={(e) => {
                                setAllowOne(e.target.checked);
                                applySettings({
                                    variables: {
                                        priority: priority,
                                        one: e.target.checked
                                    }
                                })
                            }}/>{' '}
                            Allow only one active schema at a time
                        </Label>
                    </FormGroup>
                    <FormGroup className={allowOne ? "d-none" : ""}>
                        <h3 className={"mt-4 mb-2"}>Schema priority</h3>
                        <Input type="select" defaultValue={props.settings.multiSchemaPriority} onChange={(e) => {
                            setPriority(e.target.value);
                            applySettings({
                                variables: {
                                    one: allowOne,
                                    priority: e.target.value
                                }
                            })
                        }}>
                            <option value={"lowest"}>Lowest temperature</option>
                            <option value={"highest"}>Highest temperature</option>
                        </Input>
                        <FormText>Which schema should be activated?</FormText>
                    </FormGroup>
                </Form>
            </Col>
        </Row>
    </>
}


interface Settings {
    oneSchemaMode: boolean
    multiSchemaPriority: string
}


