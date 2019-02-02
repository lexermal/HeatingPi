import * as React from 'react'
import styles from './EditableLabel.module.css'
import {createRef} from "react";

class EditableLabel extends React.Component<EditableLabelProps, EditableLabelStats> {

    private areaRef = createRef<HTMLTextAreaElement>()

    constructor(props: EditableLabelProps, context: any) {
        super(props, context)
        this.state = {value: props.value || "", defaultvalue: props.value || ""}
        this.onChange = this.onChange.bind(this)
        this.autoGrow = this.autoGrow.bind(this)
    }

    public render() {
        if (this.props.disabled) {
            return <div className={styles.input}>{this.state.value} </div>
        }
        return <textarea ref={this.areaRef} className={styles.input} onKeyUp={this.autoGrow} value={this.state.value} onChange={(e: any) => this.setState({value: e.target.value})}
                         onKeyPress={this.onChange} onBlur={e => {
            if (this.state.defaultvalue !== e.target.value) {
                this.setState({defaultvalue: e.target.value})
                this.props.onSumbit(e.target.value)
            }
        }}/>
    }

    public componentDidMount(): void {
        if (!(this.props.disabled)) {
            this.autoGrow()
            new MutationObserver(this.autoGrow).observe(this.areaRef.current!, {attributes: true, attributeFilter: ["style"]})
        }
    }

    private autoGrow() {
        this.areaRef.current!.style.height = (this.areaRef.current!.scrollHeight) + "px"
    }

    private onChange(e: any) {
        if (e.which === 9 || e.which === 13) {
            e.target.blur()
        }
    }
}

interface EditableLabelProps {
    value?: string
    disabled?: boolean
    onSumbit: (value: string) => void
}


interface EditableLabelStats {
    value: string
    defaultvalue: string
}

export default EditableLabel