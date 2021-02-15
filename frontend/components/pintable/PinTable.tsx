import React from "react";
import css from "./PinTable.module.css";
import { Col, Container, Row } from "reactstrap";
import EditableLabel from "../label/editable/EditableLabel";

interface Props {
    pins: Pin[],
    iconRenderer: (pin: Pin) => JSX.Element,
    labelOnSubmit?: (pin: Pin, value: string) => void
}

export default function PinTable(props: Props) {
    const rows = [];

    for (let i = 0; i < props.pins.length; i = i + 2) {

        const firstColPin = props.pins[i];
        const secongColPin = props.pins[i + 1];

        rows.push(
            <Row key={firstColPin.id}>
                {firstColPin && renderColumn(firstColPin, props)}
                {secongColPin && renderColumn(secongColPin, props)}
            </Row>
        );
    }
    return <Container>{rows}</Container>;
}

function renderColumn(e: Pin, props: Props) {
    return <Col className={css.names} md={6}>
        <Row className={"no-gutters"}>
            <Col className={"col-sm-auto mr-1"}>
                {props.iconRenderer(e)}
            </Col>
            <Col>
                <EditableLabel disabled={props.labelOnSubmit === undefined} value={e.name}
                               onSubmit={(value) => props.labelOnSubmit(e, value)}/>
            </Col>
        </Row>
    </Col>
}

export interface Pin {
    id: number
    name: string
    active: boolean
    activeByDefault: boolean
}
