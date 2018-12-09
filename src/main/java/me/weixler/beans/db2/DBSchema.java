package me.weixler.beans.db2;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;


@Entity(name = "Pin")
@Table(name = "pin")
public class DBSchema {

    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private boolean active;

    @OneToMany(mappedBy = "pin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DBPinState> dbPinStates = new ArrayList<>();

    public DBSchema() {
    }

    public DBSchema(String name) {
        this.name = name;
    }

    public void addDBSchemaState(DBPinState dbPinState) {
        dbPinStates.add(dbPinState);
        dbPinState.setDbSchema(this);
    }

    public void removeDBSchemaState(DBPinState dbPinState) {
        dbPinStates.remove(dbPinState);
        dbPinState.setDbSchema(null);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public List<DBPinState> getDbPinStates() {
        return dbPinStates;
    }
}