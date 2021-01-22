import * as React from 'react'
import { Container } from 'reactstrap'
import { faPowerOff } from "@fortawesome/free-solid-svg-icons"
import { queryHandler } from '../BackendHandler/BackendHandler'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import PinTable, { Pin } from '../../components/pintable/PinTable'
import { EDIT_PIN, mutationHandler, SETTINGS } from '../../utils/backendCalls'
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





