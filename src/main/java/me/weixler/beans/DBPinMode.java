package me.weixler.beans;

import javax.persistence.*;

@Entity(name = "pinState")
@Table(name = "pin_state")
public class DBPinMode {

    @Id
    @GeneratedValue
    private Long id;
    private Long mode;// 0...off, 1...on, 2....unchanged

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
    @JoinColumn(name = "pin_id")
    private DBPin dbPin;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
    @JoinColumn(name = "schema_id")
    private DBSchema dbSchema;

    public DBPinMode() {
    }

    public DBPinMode(long mode) {
        this.mode = mode;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DBPinMode)) return false;
        return id != null && id.equals(((DBPinMode) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public long getMode() {
        return mode;
    }

    public void setMode(long mode) {
        this.mode = mode;
    }

    public DBSchema getDbSchema() {
        return dbSchema;
    }

    public void setDbSchema(DBSchema dbSchema) {
        this.dbSchema = dbSchema;
    }

    public DBPin getDbPin() {
        return dbPin;
    }

    public DBPin getPin() {
        return dbPin;
    }

    public void setDbPin(DBPin dbPin) {
        this.dbPin = dbPin;
    }

    @Override
    public String toString() {
        return "DBPinMode{id=" + id + ", mode=" + mode + '}';
    }
}