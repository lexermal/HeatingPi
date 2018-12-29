import * as React from 'react'
import styles from './LabelSwitch.module.css'

class LabelSwitch extends React.Component<EditableLabelProps, EditableLabelStats> {

    constructor(props: EditableLabelProps, context: any) {
        super(props, context)

        this.state = {index: props.defaultindex || 0, defaultindex: props.defaultindex || 0}
        this.onSave = this.onSave.bind(this)
        this.onClick = this.onClick.bind(this)
    }

    public render() {
        return <div title={this.props.tooltip || ""} onClick={this.onClick} className={styles.switch} onMouseOut={this.onSave}>{this.props.switchlist[this.state.index][0]}</div>
    }

    private onClick(e: any) {
        this.setState({index: this.state.index + 1 < this.props.switchlist.length ? this.state.index + 1 : 0})
    }

    private onSave() {
        if (this.state.index !== this.state.defaultindex) {
            this.setState({defaultindex: this.state.index})
            this.props.onChange(this.props.switchlist[this.state.index][1])
        }
    }
}

interface EditableLabelProps {
    tooltip?: string
    defaultindex?: number
    switchlist: string[][]
    onChange: (value: string) => void
}


interface EditableLabelStats {
    index: number
    defaultindex: number
}

export default LabelSwitch