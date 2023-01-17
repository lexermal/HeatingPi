import React from "react";
import { Schema } from "../SchemaView";
import OverlayModal from "../../../components/overlay/modal/OverlayModal";
import { DELETE_SCHEMA, mutationHandler } from "../../../utils/backendCalls";
import { faCheck, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";

export function SchemaDeleteModal(props: { schema: Schema, className?: string }) {
    const deleteSchema = mutationHandler(DELETE_SCHEMA, "schema", { delete: { mutationName: "deleteSchema" } })

    return <OverlayModal
            //@ts-ignore
icon={faTrash}
        submitText={"Yes"}
    //@ts-ignore
    iconSubmit={faCheck}
    //@ts-ignore
    iconCancel={faTimes}
        buttonLabel={"Delete"}
        title={"Should this schema be deleted?"}
        className={"btn btn-danger float-right radius-right " + (props.className || "")}
        onSubmit={() => deleteSchema({ variables: { id: props.schema.id } })}>
        <h3>{props.schema.name}</h3>
    </OverlayModal>
}
