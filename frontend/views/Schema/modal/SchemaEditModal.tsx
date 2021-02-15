import { Schema } from "../SchemaView";
import React, { useState } from "react";
import { renderPins } from "./SchemaAddModal";
import { Pin } from "../../../components/pintable/PinTable";
import OverlayModal from "../../../components/overlay/modal/OverlayModal";
import { EDIT_SCHEMA, mutationHandler } from "../../../utils/backendCalls";
import { faCheck, faPencilAlt, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Col, FormGroup, Input, Row } from "reactstrap";
import Toast from "../../../utils/Toast";

export function SchemaEditModal(props: { schema: Schema, pins: Pin[] }) {
    const [newName, setNewName] = useState(props.schema.name);
    const [editedModes, setEditedModes] = useState(props.schema.pinModes);
    const [min, setMin] = useState(props.schema.temperature.min.toString());
    const [max, setMax] = useState(props.schema.temperature.max.toString());
    const editSchema = mutationHandler(EDIT_SCHEMA, "schema", { edit: true })

    return <OverlayModal
        title={newName}
        icon={faPencilAlt}
        submitText={"Save"}
        buttonLabel={"Edit"}
        iconSubmit={faCheck}
        iconCancel={faTimes}
        className={"btn btn-warning hoverbutton float-right radius-left"}
        onSubmit={() => {
            if (newName.trim().length === 0) {
                Toast.error("The schema name needs to be set.")
                return;
            }

            if (Number(min) >= Number(max)) {
                Toast.error("The max temperature needs to be larger than min temperature.")
                return;
            }

            editSchema({
                variables: {
                    min: Number(min),
                    max: Number(max),
                    name: newName,
                    id: props.schema.id,
                    mode: editedModes.map((data) => ({ mode: data.mode, pinId: data.pin.id } as InputMode))
                }
            })
        }}>
        <input
            value={newName}
            placeholder={"Name"}
            className={"form-control mb-2"}
            onChange={(e: any) => setNewName(e.target.value)}/>

        {renderPins(props.pins, editedModes, setEditedModes)}

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

export interface InputMode {
    pinId: number
    mode: number
}
