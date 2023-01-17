import { Mode } from "../SchemaView";
import React, { useState } from "react";
import Toast from "../../../utils/Toast";
import { InputMode } from "./SchemaEditModal";
import { Col, FormGroup, Input, Row } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PinTable, { Pin } from "../../../components/pintable/PinTable";
import OverlayModal from "../../../components/overlay/modal/OverlayModal";
import { faCheck, faPlus, faPowerOff, faTimes } from "@fortawesome/free-solid-svg-icons";
import { ADD_SCHEMA, mutationHandler, SchemaFragment } from "../../../utils/backendCalls";
import LabelSwitch, { SwitchListType } from "../../../components/label/switch/LabelSwitch";

export function AddModal(props: { pins: Pin[] }) {
    const defaultModes = props.pins.map(pin => ({ mode: 2, pinId: pin.id } as InputMode));

    const [min, setMin] = useState("");
    const [max, setMax] = useState("");
    const [newName, setNewName] = useState("");
    const [modes, setModes] = useState(defaultModes);
    const addSchema = mutationHandler(ADD_SCHEMA, "schema", {
        add: {
            mutationName: "addSchema",
            mutationFragment: SchemaFragment
        }
    });

    const convertedModes = modes.map(value => ({
        mode: value.mode,
        pin: props.pins.filter(value1 => value1.id === value.pinId)[0]
    } as Mode));

    return <OverlayModal
            //@ts-ignore
icon={faPlus}
        buttonLabel={"Add"}
        title={"New schema"}
    //@ts-ignore
    iconSubmit={faCheck}
    //@ts-ignore
    iconCancel={faTimes}
        className={"btn btn-primary add-button"}
        onSubmit={() => {
            if (newName.trim().length === 0) {
                Toast.error("The schema name needs to be set.")
                return;
            }

            if (Number(min) >= Number(max)) {
                Toast.error("The max temperature needs to be larger than min temperature.")
                return;
            }

            addSchema({ variables: { name: newName.trim(), mode: modes, min: Number(min), max: Number(max) } })
            setModes(defaultModes);
            setMin("");
            setMax("")
        }}>

        <input placeholder={"Name"}
               className={"form-control mb-2"}
               onChange={(e: any) => setNewName(e.target.value)}/>

        {renderPins(props.pins, convertedModes, data1 => setModes(data1.map(value => ({
            mode: value.mode,
            pinId: value.pin.id
        }))))}

        <Row form className={"mt-2"}>
            <Col md={6}>
                <FormGroup>
                    <Input
                        value={min}
                        type={"number"}
                        placeholder="Min temperature"
                        onChange={(e) => setMin(e.target.value)}/>
                </FormGroup>
            </Col>
            <Col md={6}>
                <FormGroup>
                    <Input
                        value={max}
                        type={"number"}
                        placeholder="Max temperature"
                        onChange={(e) => setMax(e.target.value)}/>
                </FormGroup>
            </Col>
        </Row>
    </OverlayModal>
}

export function renderPins(pins: Pin[], modes: Mode[], setModes: (data: Mode[]) => void) {
    return <PinTable pins={pins} iconRenderer={(pin: Pin) => {
        const currentMode = modes.filter((mode: Mode) => mode.pin.id === pin.id)[0];

        return <LabelSwitch
            instantSave={true}
            switchlist={switchList}
            tooltip={"Check pin reaction"}
            defaultIndex={currentMode.mode}
            onChange={(newMode: number) => {
                const filteredModes = modes.filter((mode: Mode) => mode.pin.id !== pin.id);

                setModes([...filteredModes, { mode: newMode, pin }])
            }}/>
    }}/>
}

export const switchList = [
      //@ts-ignore
      [<FontAwesomeIcon icon={faPowerOff} key={1} size={"lg"} color={"red"}/>, 0, "Change to disable pin"],
    //@ts-ignore
    [<FontAwesomeIcon icon={faPowerOff} key={2} size={"lg"} color={"green"}/>, 1, "Change to enable pin"],
    //@ts-ignore
    [<FontAwesomeIcon icon={faPowerOff} key={3} size={"lg"} color={"orange"}/>, 2, "Change to leave pin unchanged"]
] as SwitchListType;
