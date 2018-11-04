import * as React from 'react'
import {Container, Table} from 'reactstrap'
import Row from 'reactstrap/lib/Row'
import BackendCalls from '../../utils/backendCalls'
import LabelSwitch from '../../components/label/switch/LabelSwitch'

class PinViewModal extends React.Component<PinViewProps, PinViewStats> {

    constructor(props: PinViewProps) {
        super(props)

        this.state = {pins: [undefined], modified: false}

        new BackendCalls().getPins((e: any) => this.setState({pins: e}), (err: any) => console.error(err), props.schema !== -1 ? props.schema : undefined)
        this.saveName = this.saveName.bind(this)
    }


    public componentWillReceiveProps(nextProps: Readonly<PinViewProps>, nextContext: any): void {
        if (nextProps.saveNow && this.state.modified) {
            this.setState({modified: false})
            this.props.onSave(this.props.schema, this.state.pins!)
        }
    }


    public render() {
        return <Container>
            <Row>
                <Table>
                    <tbody>
                    <tr>
                        <th>Pinnumber</th>
                        <th>Name</th>
                        <th>State</th>
                    </tr>

                    {this.state.pins!.filter((e: any) => e !== undefined && e !== null).sort((a: Pin, b: Pin) => a.id > b.id ? 1 : -1).map((e: Pin) => <tr key={e.id}>
                        <td>{e.id}</td>
                        <td>{e.name}</td>
                        <td>{<LabelSwitch defaultindex={e.state} tooltip={"Click to change"} switchlist={[["unmodified", "2"], ["active", "1"], ["deactivated", "0"]]}
                                          onChange={(g: string) => this.saveState(e.id, g)}/>}</td>
                    </tr>)}
                    </tbody>
                </Table>
            </Row>
        </Container>
    }

    private saveName(id: number, value: string) {
        const pins: [Pin] = this.state.pins!
        const pin: Pin = pins!.splice(pins!.findIndex((e: Pin) => e.id === id), 1)[0]

        pin!.name = value
        pins!.push(pin)

        this.setState({pins, modified: true})
    }

    private saveState(id: number, value: string) {
        const pins: [Pin] = this.state.pins!
        const pin: Pin = pins!.splice(pins!.findIndex((e: Pin) => e.id === id), 1)[0]

        pin!.state = +value
        pins!.push(pin)

        this.setState({pins, modified: true})
    }


}

interface PinViewProps {
    pins?: [any]
    schema: number
    saveNow: boolean
    onSave: (schema: number, pins: [any]) => void
}

interface Pin {
    id: number
    name: string
    state: number

}

interface PinViewStats {
    pins?: [any]
    modified: boolean
}

export default PinViewModal