import './SchemaView.css'
import * as React from 'react'
import * as toastr from 'toastr'
import Row from 'reactstrap/lib/Row'
import {Container, Table} from 'reactstrap'
import BackendCalls from '../../utils/backendCalls'
import PinViewModal, {Mode} from '../Pins/PinViewModal'
import LabelSwitch from '../../components/label/switch/LabelSwitch'
import OverlayModal from '../../components/overlay/modal/OverlayModal'
import EditableLabel from '../../components/label/editable/EditableLabel'

class SchemaView extends React.Component<PinViewProps, PinViewStats> {
    private backend: BackendCalls

    constructor(props: PinViewProps) {
        super(props)
        this.backend = new BackendCalls()

        this.state = {schema: [undefined], hoverindex: -1, saveNow: false, schemaname: ""}

        this.getSchemas()
        this.saveName = this.saveName.bind(this)
        this.saveNewSchema = this.saveNewSchema.bind(this)
    }

    public render() {
        return <Container>
            <h1 className={"h1"}>Schemas</h1>
            <div className={"text-right"}>
                <OverlayModal className={"btn btn-primary add-button"} title={"Add a new schema"} buttonLabel={"Add schema"} onSubmit={() => this.setState({saveNow: true})}>

                    <input placeholder={"Name"} className={"form-control"} onChange={(e: any) => this.setState({schemaname: e.target.value})}/>
                    <PinViewModal saveNow={this.state.saveNow} onSave={this.saveNewSchema}/>
                </OverlayModal></div>
            <Row>
                <Table>
                    <tbody>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Active</th>
                        <th/>
                        <th/>
                    </tr>

                    {this.state.schema!.filter((e: any) => e !== undefined && e !== null).map((e: Schema) =>
                        <tr key={e.id} className={"schemaview"}>
                            <td>{e.id}</td>
                            <td><EditableLabel value={e.name} onSumbit={(g: string) => this.saveName(e.id, g)}/></td>
                            <td><LabelSwitch tooltip={"Click to change"} switchlist={[["Active", "true"], ["Deactivated", "false"]]}
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
                </Table>
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
        console.log("SAVE : " + id + " with value: " + value)
        toastr.success("The changes have been successfully saved.")
        // @todo graphql implementieren
    }

    private setSchemaActive(id: number, value: string) {
        console.log("SAVE : " + id + " with value: " + value)
        toastr.success("The schema has been successfully activated.")
        // @todo graphql implementieren
    }

    private deleteSchema(id: number) {
        console.log("DELETE Schema : " + id)
        toastr.success("The schema was successfully deleted.")
        // @todo graphql implementieren
    }

    private saveEditedPins(schema: number, pins: [any]) {
        console.log("new schemas", pins)
        toastr.warning("Graphqlzeug implementieren und das vollgende schema verändern " + schema)
    }

    private onError(e: string) {
        toastr.error("Change could not be made permanently. " + e)
    }

}

interface PinViewProps {
    schema?: [any]
}

interface Schema {
    id: number
    name: string
    active: boolean

}

interface PinViewStats {
    schema?: [any]
    saveNow: boolean
    schemaname: string
    hoverindex: number
}

export default SchemaView