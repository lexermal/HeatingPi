import * as React from 'react'
import * as toastr from 'toastr'
import {Mode} from "../Pins/PinViewModal"
import styles from "./Dashboard.module.css"
import {Container, Table, Row} from 'reactstrap'
import BackendCalls from '../../utils/backendCalls'
import LabelSwitch from '../../components/label/switch/LabelSwitch'
import EditableLabel from '../../components/label/editable/EditableLabel'
import {faToggleOff, faToggleOn} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

class DashboardView extends React.Component<{}, PinViewStats> {

    private backend: BackendCalls

    public constructor(props: {}) {
        super(props)

        this.state = {modepins: undefined, name: ""}

        this.backend = new BackendCalls()
        this.backend.getSchemas((e: [Schema]) => this.setState({name: e.length < 1 ? "" : e[0].name, modepins: e.length < 1 ? undefined : e[0].pins}), this.onError, true)
        this.saveName = this.saveName.bind(this)
    }

    public render() {
        return <Container>
            <Row>
                {!this.state.modepins ? <div className={styles.notFound}>No active schema found</div> : <div className={"w-100"}>
                    <div className={styles.schemaHeading}>Pin status</div>
                    <Table>
                        <tbody>

                        {this.state.modepins.sort((e: Mode, x: Mode) => e.pin.id > x.pin.id ? 1 : -1).map((e: Mode) => <tr key={e.pin.id}>
                            <td><EditableLabel disabled={true} value={e.pin.name} onSumbit={() => null}/></td>
                            <td><LabelSwitch instantSave={true} defaultindex={e.mode === 0 ? 1 : 0} disabled={true}
                                             switchlist={[
                                                 [<FontAwesomeIcon key={1} icon={faToggleOn} size={"lg"}/>, "true"],
                                                 [<FontAwesomeIcon key={1} icon={faToggleOff} size={"lg"}/>, "false"]]} onChange={() => null}/>
                            </td>
                        </tr>)}
                        </tbody>
                    </Table></div>}
            </Row>
            <Row>
                <h2>Active scheme: {this.state.name}</h2>
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
    modepins: [Mode] | undefined
    name: string
}

export default DashboardView