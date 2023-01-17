import * as React from 'react'
import { useEffect } from 'react'
import css from "./Dashboard.module.css"
import { Schema } from "../Schema/SchemaView";
import { Col, Container, Row } from 'reactstrap'
import { DASHBOARD } from '../../utils/backendCalls'
import { faCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import PinTable, { Pin } from '../../components/pintable/PinTable'
import { useLazyQuery } from '@apollo/client';

let isLoaded = null;

function triggerOnlineCycle(fetching: () => void) {
    setTimeout(() => {
        if (isLoaded) {
            fetching();

            triggerOnlineCycle(fetching);
        }
    }, 5000)
}

export default function DashboardView() {
    const [fetchData, { data, loading }] = useLazyQuery(DASHBOARD, { fetchPolicy: "cache-and-network" });

    useEffect(() => {
        isLoaded = true
        triggerOnlineCycle(() => fetchData());

        // page unmount
        return function cleanup() {
            isLoaded = null;
        };
    }, []);

    if (!data) {
        return <div>Loading...</div>
    }

    const pins = [...data.pins].sort((e: Pin, x: Pin) => e.id > x.id ? 1 : -1);

    return <Container className={"mt-5"}>
        <Row>
            <Col>
                <h1>Temperature: {data.temperature.toFixed(2) + "°C"}</h1>
            </Col>
        </Row>
        {renderActiveSchemas(data.schema)}
        <h1 className={"mt-4"}>Current pin status</h1>
        <Row>
            <PinTable pins={pins} iconRenderer={pin => renderIcon(pin.active)}/>
        </Row>
    </Container>
}

function renderActiveSchemas(schemas: Schema[]) {
    if (schemas.length === 0) {
        return <div className={css.notFound}>No active schemas found.</div>
    }

    return <>
        <h1 className={"mt-4"}>Active schemas</h1>
        {schemas.map(schema => {
                return <Row key={schema.id + schema.name} className={"no-gutters " + css.textSize}>
                    <Col className={"col-sm-auto mr-1"}>
                        {renderIcon(schema.running, "text-warning")}
                    </Col>
                    <Col>
                        <p>{schema.name}</p>
                    </Col>
                </Row>
            }
        )
        }
    </>
}

function renderIcon(active: boolean, inactiveClass?: string) {
    if (active) {
        //@ts-ignore
        return <FontAwesomeIcon key={1} icon={faCircle} size={"lg"} title={"activ"} className={"text-success"}/>
    }
    //@ts-ignore
    return <FontAwesomeIcon key={1} icon={faCircle} size={"lg"} title={"disabled"}
                            className={inactiveClass || "text-danger"}/>
}

