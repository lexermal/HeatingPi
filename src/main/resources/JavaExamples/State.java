package JavaExamples;

import javax.persistence.*;
import java.io.Serializable;

@Entity
public class State implements Serializable {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("pin_id")
    private Pin pin;
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("schema_id")
    private Schema schema;
    @Column
    private long state; // 0...off, 1...on, 2....unchanged


    public State() {

    }


    public long getState() {
        return state;
    }

    public void setState(long state) {
        this.state = state;
    }

    public State(Pin pin, Schema schema) {
        this.pin = pin;
        this.schema = schema;
    }

    public Pin getPin() {
        return pin;
    }

    public void setPin(Pin pin) {
        this.pin = pin;
    }

    public Schema getSchema() {
        return schema;
    }

    public void setSchema(Schema schema) {
        this.schema = schema;
    }
}
