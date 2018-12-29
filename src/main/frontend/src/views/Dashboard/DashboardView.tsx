import * as React from 'react'
import {Container, Table} from 'reactstrap'
import Row from 'reactstrap/lib/Row'
import EditableLabel from '../../components/label/editable/EditableLabel'
import * as toastr from 'toastr'
import LabelSwitch from '../../components/label/switch/LabelSwitch'
import BackendCalls from '../../utils/backendCalls'
import {Mode} from "../Pins/PinViewModal"
import styles from "./Dashboard.module.css"

class DashboardView extends React.Component<{}, PinViewStats> {

    private backend: BackendCalls

    public constructor(props: {}) {
        super(props)

        this.state = {schema: undefined}

        this.backend = new BackendCalls()
        this.backend.getSchemas((e: any) => this.setState({schema: e[0]}), this.onError, true)
        this.saveName = this.saveName.bind(this)
    }

    public render() {
        console.log(this.state.schema)
        return <Container>
            <br/>Dashboard
            <h1>Overview of different things</h1>
            <br/>
            <br/>Active Pin Schema
            <Row>
                {!this.state.schema ? <div className={styles.notFound}>No active schema found</div> : <Table>
                    <tbody>
                    <tr>
                        <th>Pinnumber</th>
                        <th>Name</th>
                        <th>Defaultvalue</th>
                    </tr>

                    {this.state.schema.pins.map((e: Mode) => <tr key={e.pin.id}>
                        <td>{e.pin.id}</td>
                        <td><EditableLabel disabled={true} value={e.pin.name} onSumbit={() => null}/></td>
                        <td><LabelSwitch disabled={true} switchlist={[["Active", "true"], ["Deactivated", "false"]]} onChange={() => null}/></td>
                    </tr>)}
                    </tbody>
                </Table>}
            </Row>
        </Container>
    }

    private saveName(id: number, value: string) {
        this.backend.editPins(id, value, () => toastr.success("The changes have been successfully saved."), this.onError)
    }

    private onError(e: string) {
        toastr.error("Change could not be made permanently. " + e)
    }

}

interface Schema {
    id: string
    pins: [Mode]
    name: string
    active: boolean
}

interface PinViewStats {
    schema: Schema | undefined
}

export default DashboardView