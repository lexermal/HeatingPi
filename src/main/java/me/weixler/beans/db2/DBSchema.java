package me.weixler.beans.db2;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;


@Entity(name = "Schema")
@Table(name = "schema")
public class DBSchema {

    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private boolean active;

    @OneToMany(mappedBy = "dbSchema", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DBPinMode> dbPinModes = new ArrayList<>();

    public DBSchema() {
    }

    public DBSchema(String name) {
        this.name = name;
    }

    public void addDBSchemaState(DBPinMode dbPinMode) {
        dbPinModes.add(dbPinMode);
        dbPinMode.setDbSchema(this);
    }

    public void removeDBSchemaState(DBPinMode dbPinMode) {
        dbPinModes.remove(dbPinMode);
        dbPinMode.setDbSchema(null);
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

    public List<DBPinMode> getDbPinModes() {
        return dbPinModes;
    }
}