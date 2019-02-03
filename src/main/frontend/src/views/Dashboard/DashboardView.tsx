import * as React from 'react'
import * as toastr from 'toastr'
import styles from "./Dashboard.module.css"
import {Container, Table, Row} from 'reactstrap'
import BackendCalls from '../../utils/backendCalls'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import EditableLabel from '../../components/label/editable/EditableLabel'
import {faToggleOff, faToggleOn} from "@fortawesome/free-solid-svg-icons"

class DashboardView extends React.Component<{}, PinViewStats> {

    private backend: BackendCalls

    public constructor(props: {}) {
        super(props)

        this.state = {modepins: undefined, name: ""}

        this.backend = new BackendCalls()
        this.backend.getSchemas((e: [Schema]) => this.setState({name: e.length < 1 ? "" : e[0].name}), this.onError, true)
        this.backend.getActPinModes((e: any) => this.setState({modepins: e}), this.onError)
        this.saveName = this.saveName.bind(this)
    }

    public render() {
        return <Container>
            <Row>
                {!this.state.modepins ? <div className={styles.notFound}>No active schema found</div> : <div className={"w-100"}>
                    <div className={styles.schemaHeading}>Pin status</div>
                    <Table>
                        <tbody>

                        {this.state.modepins.sort((e: Mode, x: Mode) => e.id > x.id ? 1 : -1).map((e: Mode) => <tr key={e.id}>
                            <td className={styles.names}><EditableLabel disabled={true} value={e.name} onSumbit={() => null}/></td>
                            <td>
                                {
                                    e.active ? <FontAwesomeIcon key={1} icon={faToggleOn} size={"lg"} title={"activ"} className={"text-success"}/> :
                                        <FontAwesomeIcon key={1} icon={faToggleOff} size={"lg"} title={"disabled"} className={"text-danger"}/>
                                }
                            </td>
                        </tr>)}
                        </tbody>
                    </Table></div>}
            </Row>
            <Row>
                {
                    this.state.name !== "" ? <h2>Active scheme: {this.state.name}</h2> : null
                }
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

interface Mode {
    id: number
    name: string
    active: boolean
}

interface Schema {
    id: string
    pins: [Mode]
    name: string
    active: boolean
}

interface PinViewStats {
    modepins: [Mode] | undefined
    name: string
}

export default DashboardView