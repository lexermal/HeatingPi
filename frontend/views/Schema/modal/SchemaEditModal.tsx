import { Schema } from "../SchemaView";
import React, { useState } from "react";
import { renderPins } from "./SchemaAddModal";
import { Pin } from "../../../components/pintable/PinTable";
import OverlayModal from "../../../components/overlay/modal/OverlayModal";
import { EDIT_SCHEMA, mutationHandler } from "../../../utils/backendCalls";
import { faCheck, faPencilAlt, faTimes } from "@fortawesome/free-solid-svg-icons";

export function SchemaEditModal(props: { schema: Schema, pins: Pin[] }) {
    const [newName, setNewName] = useState(props.schema.name);
    const [editedModes, setEditedModes] = useState(props.schema.pinModes);
    const editSchema = mutationHandler(EDIT_SCHEMA, "schema", { edit: true })

    return <OverlayModal
        icon={faPencilAlt}
        submitText={"Save"}
        buttonLabel={"Edit"}
        iconSubmit={faCheck}
        iconCancel={faTimes}
        title={newName}
        className={"btn btn-warning hoverbutton float-right radius-left"}
        onSubmit={() => editSchema({
            variables: {
                min: 0,
                max: 1,
                name: newName,
                id: props.schema.id,
                mode: editedModes.map((data) => ({ mode: data.mode, pinId: data.pin.id } as InputMode))
            }
        })}>
        <input
            value={newName}
            placeholder={"Name"}
            className={"form-control mb-2"}
            onChange={(e: any) => setNewName(e.target.value)}/>

        {renderPins(props.pins, editedModes, setEditedModes)}
    </OverlayModal>
}

export interface InputMode {
    pinId: number
    mode: number
}
