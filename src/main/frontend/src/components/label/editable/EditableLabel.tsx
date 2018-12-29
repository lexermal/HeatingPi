import * as React from 'react'
import styles from './EditableLabel.module.css'

class EditableLabel extends React.Component<EditableLabelProps, EditableLabelStats> {


    constructor(props: EditableLabelProps, context: any) {
        super(props, context)
        this.state = {value: props.value || "", defaultvalue: props.value || ""}
        this.onChange = this.onChange.bind(this)
    }

    public render() {
        return <input className={styles.input} value={this.state.value} onChange={(e: any) => this.setState({value: e.target.value})
        } onKeyPress={this.onChange} onBlur={e => {
            if (this.state.defaultvalue !== e.target.value) {
                this.setState({defaultvalue: e.target.value})
                this.props.onSumbit(e.target.value)
            }
        }}/>
    }


    private onChange(e: any) {
        if (e.which === 9 || e.which === 13) {
            e.target.blur()
        }
    }
}

interface EditableLabelProps {
    value?: string
    onSumbit: (value: string) => void
}


interface EditableLabelStats {
    value: string
    defaultvalue: string
}

export default EditableLabel