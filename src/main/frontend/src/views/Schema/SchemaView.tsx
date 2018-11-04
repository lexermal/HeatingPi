import * as React from 'react'
import {Container, Table} from 'reactstrap'
import Row from 'reactstrap/lib/Row'
import BackendCalls from '../../utils/backendCalls'
import EditableLabel from '../../components/label/editable/EditableLabel'
import * as toastr from 'toastr'
import LabelSwitch from '../../components/label/switch/LabelSwitch'
import './SchemaView.css'
import OverlayModal from '../../components/overlay/modal/OverlayModal'

class SchemaView extends React.Component<PinViewProps, PinViewStats> {


    constructor(props: PinViewProps) {
        super(props)

        this.state = {schema: [undefined], hoverindex: -1}

        const backend = new BackendCalls()
        backend.getSchemas((e: any) => this.setState({schema: e}), (err: any) => console.error(err))
        this.saveName = this.saveName.bind(this)
    }


    public componentWillUpdate(nextProps: Readonly<PinViewProps>, nextState: Readonly<PinViewStats>, nextContext: any): void {
        console.log(nextState.schema)
    }

    public render() {
        return <Container>
            <h1>Overview of all Schemas</h1>
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
                                <OverlayModal  className={"btn btn-warning hoverbutton"} title={"Edit " + e.name} buttonLabel={"Edit"} onSubmit={() => this.editSchema(e.id)}>
                                    <h1>hello world</h1>
                                </OverlayModal>
                                {/*<button className={"btn btn-warning"} onClick={() => this.editSchema(e.id)}>Edit</button>*/}
                                <button className={"btn btn-danger hoverbutton"} onClick={() => this.deleteSchema(e.id)}>Delete</button>
                            </td>
                        </tr>)}
                    </tbody>
                </Table>
            </Row>
        </Container>
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


    private editSchema(id: number) {
        console.log("Modal where the schema of the following item can be modified : " + id)
        toastr.warning("Modal where the schema of the following item can be modified : " + id)
        // @todo graphql implementieren
    }

    private deleteSchema(id: number) {
        console.log("DELETE Schema : " + id)
        toastr.success("The schema was successfully delete.")
        // @todo graphql implementieren
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
}

export default SchemaView