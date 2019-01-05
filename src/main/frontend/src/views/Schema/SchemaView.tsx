import './SchemaView.css'
import * as React from 'react'
import * as toastr from 'toastr'
import Row from 'reactstrap/lib/Row'
import {Container, Table} from 'reactstrap'
import BackendCalls from '../../utils/backendCalls'
import styles from "../Dashboard/Dashboard.module.css"
import PinViewModal, {Mode} from '../Pins/PinViewModal'
import LabelSwitch from '../../components/label/switch/LabelSwitch'
import OverlayModal from '../../components/overlay/modal/OverlayModal'
import EditableLabel from '../../components/label/editable/EditableLabel'

class SchemaView extends React.Component<{}, PinViewStats> {
    private backend: BackendCalls

    constructor(props: {}) {
        super(props)
        this.backend = new BackendCalls()

        this.state = {schema: undefined, hoverindex: -1, saveNow: false, schemaname: ""}

        this.getSchemas()
        this.getSchemas = this.getSchemas.bind(this)
        this.saveName = this.saveName.bind(this)
        this.saveNewSchema = this.saveNewSchema.bind(this)
        this.saveEditedPins = this.saveEditedPins.bind(this)
    }

    public render() {
        return <Container>
            <h1 className={"h1"}>Schemas</h1>
            <div className={"text-right"}>
                <OverlayModal className={"btn btn-primary add-button"} title={"Add a new schema"} buttonLabel={"Add schema"} onSubmit={() => this.setState({saveNow: true})}>

                    <input placeholder={"Name"} className={"form-control"} onChange={(e: any) => this.setState({schemaname: e.target.value})}/>
                    <PinViewModal saveNow={this.state.saveNow} onSave={this.saveNewSchema}/>
                </OverlayModal></div>
            <Row>{(this.state.schema === undefined || this.state.schema.length < 1) ? <div className={styles.notFound}>No schemas found</div> : <div className={"w-100"}>
                <Table>
                    <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Setting</th>
                        <th/>
                        <th/>
                    </tr>

                    {this.state.schema.map((e: Schema) =>
                        <tr key={e.id} className={"schemaview"}>
                            <td><EditableLabel value={e.name} onSumbit={(g: string) => this.saveName(e.id, g)}/></td>
                            <td><LabelSwitch disabled={e.active} key={e.active + ""} defaultindex={e.active ? 0 : 1} tooltip={"Click to change"}
                                             switchlist={[["Active", true], ["Deactivated", false]]} instantSave={true}
                                             onChange={(g: string) => this.setSchemaActive(e.id, g)}/></td>
                            <td className={"text-right"}>

                                <OverlayModal className={"btn btn-danger hoverbutton float-right radius-right"} submitText={"Yes"} title={"Delete the following element?"}
                                              buttonLabel={"Delete"} onSubmit={() => this.deleteSchema(e.id)}>
                                    <h3>{e.name}</h3>
                                </OverlayModal>
                                <OverlayModal className={"btn btn-warning hoverbutton float-right radius-left"} title={e.name} buttonLabel={"Edit"}
                                              onSubmit={() => this.setState({saveNow: true})} submitText={"Save"}>
                                    <PinViewModal schema={e.id} saveNow={this.state.saveNow} onSave={this.saveEditedPins}/>
                                </OverlayModal>
                            </td>
                        </tr>)}
                    </tbody>
                </Table></div>}
            </Row>
        </Container>
    }

    private getSchemas() {
        this.backend.getSchemas((e: any) => this.setState({schema: e}), this.onError)
    }

    private saveNewSchema(schema: number, pins: [Mode]) {
        if (this.state.schemaname.trim().length === 0) {
            toastr.error("The schema name needs to be set.")
            return
        }

        this.setState({saveNow: false})
        this.backend.createSchema(this.state.schemaname, pins, () => {
            toastr.success("The changes have successfully been saved.")
            this.getSchemas()
        }, this.onError)
    }

    private saveName(id: number, value: string) {
        this.backend.editSchemaName(id, value, () => {
            toastr.success("The schema was successfully updated.")
            this.getSchemas()
        }, this.onError)
    }

    private setSchemaActive(id: number, value: string) {
        if (value) {
            this.backend.activateSchema(id, () => {
                toastr.success("The schema was successfully activated.")
                this.getSchemas()
            }, this.onError)
        }

    }

    private deleteSchema(id: number) {
        this.backend.deleteSchema(id, () => {
            toastr.success("The schema was successfully deleted.")
            this.getSchemas()
        }, this.onError)
    }

    private saveEditedPins(schema: number, pins: [Mode]) {
        this.backend.editSchema(schema, this.state.schema![0].name, pins, () => {
            toastr.success("The schema was successfully updated.")
            this.getSchemas()
        }, this.onError)
    }

    private onError(e: string) {
        toastr.error("Couldn't save changes. " + e)
    }

}

interface Schema {
    id: number
    name: string
    active: boolean
}

interface PinViewStats {
    schema: [Schema] | undefined
    saveNow: boolean
    schemaname: string
    hoverindex: number
}

export default SchemaView