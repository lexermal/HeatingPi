import * as React from 'react'
import css from "./Dashboard.module.css"
import { Col, Container, Row } from 'reactstrap'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircle } from "@fortawesome/free-solid-svg-icons"
import PinTable, { Pin } from '../../components/pintable/PinTable'
import { queryHandler } from '../BackendHandler/BackendHandler'
import { DASHBOARD } from '../../utils/backendCalls'
import Temperature from "./Temperature";

export default function DashboardView() {

    return queryHandler(DASHBOARD, (data: any) => {
        const pins = data.pins.sort((e: Pin, x: Pin) => e.id > x.id ? 1 : -1);

        return <Container>
            <Row className={"no-gutters"}>
                <Col>
                    {data.schema.length > 0 && <h2 className={"mt-4"}>Active scheme: <b>{data.schema[0].name}</b></h2>}
                </Col>
            </Row>
            <Row className={"no-gutters"}>
                <Col>
                    <h2>Temperature: <Temperature unit={"°C"}/></h2>
                </Col>
            </Row>
            {renderSchema(pins)}
        </Container>
    })
}

function renderSchema(pins: Pin[]) {
    if (pins.length === 0) {
        return <div className={css.notFound}>No active schema found</div>
    }

    return <Row>
        <div className={css.schemaHeading}>Current pin status</div>
        <PinTable pins={pins} iconRenderer={renderIcon}/>
    </Row>
}

function renderIcon(pin: Pin) {
    if (pin.activeByDefault) {
        return <FontAwesomeIcon key={1} icon={faCircle} size={"lg"} title={"activ"} className={"text-success"}/>
    }
    return <FontAwesomeIcon key={1} icon={faCircle} size={"lg"} title={"disabled"} className={"text-danger"}/>
}

