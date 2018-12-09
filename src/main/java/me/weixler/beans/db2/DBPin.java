package me.weixler.beans.db2;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;


@Entity(name = "Pin")
@Table(name = "pin")
public class DBPin {

    @Id
    @GeneratedValue
    private Long id;
    private String name;

    @OneToMany(mappedBy = "dbPin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DBPinMode> dbPinModes = new ArrayList<>();

    public DBPin() {
    }

    public void addDBPinState(DBPinMode dbPinMode) {
        dbPinModes.add(dbPinMode);
        dbPinMode.setDbPin(this);
    }

    public void removeDBPinState(DBPinMode dbPinMode) {
        dbPinModes.remove(dbPinMode);
        dbPinMode.setDbPin(null);
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

    public boolean getDefaultmode() {
        return Controller_isActivatedByDefault();
    }

    public void setDefaultmode(boolean defaultmode) {
        this.Controller_setDefaultState(defaultmode);
    }

    public boolean getActive() {
        return this.Controller_isActivated();
    }

    public boolean getDefaultActive() {
        return this.Controller_isActivatedByDefault();
    }

    private boolean Controller_isActivatedByDefault() {
        //@Todo implementation
        return false;
    }


    private boolean Controller_isActivated() {
        //@Todo implementation
        return false;
    }

    public void Controller_setMode(long mode) {
        //@Todo implementation
    }

    public void Controller_setDefaultState(boolean state) {
        //@todo implementation
    }
}