package me.weixler.beans.db2;

import me.weixler.Utils;

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
    @Transient
    private long simulatedMode = 0;
    @Transient
    private boolean simulatedDefaultState = false;

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
        if (Utils.simulation) {
            return simulatedDefaultState;
        } else {
            //@Todo implementation
            return false;
        }

    }


    private boolean Controller_isActivated() {
        if (Utils.simulation) {
            return simulatedMode == 1;
        } else {
            //@Todo implementation
            return false;
        }

    }

    public void Controller_setMode(long mode) {
        if (mode != 2) {
            if (Utils.simulation) {
                simulatedMode = mode;
            } else {
                //@Todo implementation
            }
        }
    }

    public void Controller_setDefaultState(boolean state) {
        if (Utils.simulation) {
            simulatedDefaultState = state;
        } else {
            //@Todo implementation
        }
    }
}