import * as React from 'react'
import {Container, Table} from 'reactstrap'
import Row from 'reactstrap/lib/Row'
import BackendCalls from '../../utils/backendCalls'
import EditableLabel from '../../components/label/editable/EditableLabel'
import * as toastr from 'toastr'
import LabelSwitch from '../../components/label/switch/LabelSwitch'
import './SchemaView.css'
import OverlayModal from '../../components/overlay/modal/OverlayModal'
import PinViewModal from '../Pins/PinViewModal'

class SchemaView extends React.Component<PinViewProps, PinViewStats> {

    constructor(props: PinViewProps) {
        super(props)

        this.state = {schema: [undefined], hoverindex: -1, saveNow: false, newPinSchema: [undefined]}

        new BackendCalls().getSchemas((e: any) => this.setState({schema: e}), (err: any) => console.error(err))
        this.saveName = this.saveName.bind(this)
        this.saveNewSchema = this.saveNewSchema.bind(this)
    }

    public render() {
        return <Container>
            <h1 className={"h1"}>Overview of all Schemas</h1>
            <div className={"text-right"}><OverlayModal className={"btn btn-primary add-button"} title={"Add a new schema"} buttonLabel={"Add schema"}
                                                        onSubmit={this.saveNewSchema}>
                <input placeholder={"Name"}/>
                <PinViewModal schema={-1} saveNow={this.state.saveNow} onSave={(i: number, pins: [any]) => this.setState({newPinSchema: pins})}/>
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
                            <td>{<LabelSwitch tooltip={"Click to change"} switchlist={[["Active", "true"], ["Deactivated", "false"]]}
                                              onChange={(g: string) => this.saveDefaultState(e.id, g)}/>}</td>
                            <td className={"text-right"}>

                                <OverlayModal className={"btn btn-danger hoverbutton float-right"} submitText={"Yes"} title={"Delete the following element?"} buttonLabel={"Delete"}
                                              onSubmit={() => this.deleteSchema(e.id)}>
                                    <h3>{e.name}</h3>
                                </OverlayModal>
                                <OverlayModal className={"btn btn-warning hoverbutton float-right"} title={e.name} buttonLabel={"Edit"}
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

    private saveNewSchema() {
        this.setState({saveNow: true})
        console.log("SAVE : " + 2 + " with value: " + 2)
        toastr.success("The changes have successfully been saved.")
        // @todo graphql implementieren
    }

    private saveName(id: number, value: string) {
        console.log("SAVE : " + id + " with value: " + value)
        toastr.success("The changes have successfully been saved.")
        // @todo graphql implementieren
    }

    private saveDefaultState(id: number, value: string) {
        console.log("SAVE : " + id + " with value: " + value)
        toastr.success("The changes have successfully been saved.")
        // @todo graphql implementieren
    }

    private deleteSchema(id: number) {
        console.log("DELETE Schema : " + id)
        toastr.success("The schema was successfully delete.")
        // @todo graphql implementieren
    }

    private saveEditedPins(schema: number, pins: [any]) {
        toastr.warning("Graphqlzeug implementieren und das vollgende schema verändern " + this.props.schema)
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
    hoverindex: number
    saveNow: boolean
    newPinSchema: [any]
}

export default SchemaView