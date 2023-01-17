import * as React from 'react'
import Row from 'reactstrap/lib/Row'
import css from "./SchemaView.module.css"
import { Col, Container } from 'reactstrap'
import { AddModal } from './modal/SchemaAddModal'
import { Pin } from '../../components/pintable/PinTable'
import { SchemaEditModal } from './modal/SchemaEditModal'
import { SchemaDeleteModal } from './modal/SchemaDeleteModal'
import { faPowerOff } from "@fortawesome/free-solid-svg-icons"
import { queryHandler } from '../BackendHandler/BackendHandler'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import EditableLabel from '../../components/label/editable/EditableLabel'
import { ACTIVATE_SCHEMA, mutationHandler, SCHEMA } from '../../utils/backendCalls'
import LabelSwitch, { SwitchListType } from '../../components/label/switch/LabelSwitch'

export default function SchemaView() {
    return queryHandler(SCHEMA, (data) => {
        return <Container>
            <Row>
                <Col>
                    <h1 className={"mt-4"}>Schemes</h1>
                </Col>
                <Col>
                    <div className={"text-right mt-5 mb-1"}>
                        <AddModal pins={data.pins}/>
                    </div>
                </Col>
            </Row>
            <Row>{renderSchemaTable(data.schema, data.pins)}</Row>
        </Container>
    })
}

function renderSchemaTable(schema: Schema[], pins: Pin[]) {
    if (schema.length === 0) {
        return <div className={css.notFound}>No schemas found</div>
    }

    return <div className={"w-100"}>
        <Container>
            {schema.map((e: Schema) => <Schema key={e.id} schema={e} pins={pins}/>)}
        </Container>
    </div>
}

function Schema(props: { schema: Schema, pins: Pin[] }) {
    const activateSchema = mutationHandler(ACTIVATE_SCHEMA, "schema", { set: { query: SCHEMA } })

    return <Row key={props.schema.id} className={"no-gutters mb-1 " + css.names}>
        <Col className={"col-sm-auto mr-1"}>
            <LabelSwitch
                instantSave={true}
                switchlist={iconSwitchList}
                key={props.schema.active + ""}
                defaultIndex={props.schema.active ? 0 : 1}
                onChange={(activate: boolean) => activateSchema({
                    variables: {
                        active: activate,
                        id: props.schema.id
                    }
                })}/>
        </Col>
        <Col>
            <EditableLabel value={props.schema.name} disabled={true} onSubmit={() => null}/>
        </Col>
        <Col className={"text-right"}>
            <SchemaDeleteModal schema={props.schema} className={"ml-1"}/>
            <SchemaEditModal pins={props.pins} schema={props.schema}/>
        </Col>
    </Row>
}

const iconSwitchList = [
    //@ts-ignore
    [<FontAwesomeIcon key={1} icon={faPowerOff} size={"lg"} className={"text-success"}/>, true],
    //@ts-ignore
    [<FontAwesomeIcon key={2} icon={faPowerOff} size={"lg"} className={"text-danger"}/>, false, ""]
] as SwitchListType;

export interface Schema {
    id: number
    name: string
    active: boolean
    running: boolean
    pinModes: Mode[]
    temperature:{
        min:number
        max:number
    }
}

export interface Mode {
    mode: number
    pin: Pin
}
