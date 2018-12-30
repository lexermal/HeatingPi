package me.weixler.beans;

import me.weixler.Utils;
import me.weixler.controller.PinController;

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
    @Transient
    private PinController pinController;

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
        if (!Utils.simulation) {
            pinController = PinController.getInstance(id);
        }
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean getDefaultmode() {
        if (Utils.simulation) {
            return simulatedDefaultState;
        } else {
            return pinController.getDefaultMode();
        }
    }

    public void setDefaultmode(boolean defaultmode) {
        if (Utils.simulation) {
            simulatedDefaultState = defaultmode;
        } else {
            pinController.setDefaultMode(defaultmode);
        }
    }

    public boolean getActive() {
        if (Utils.simulation) {
            return simulatedMode == 1;
        } else {
            return pinController.getMode();
        }
    }

    public boolean getDefaultActive() {
        if (Utils.simulation) {
            return simulatedDefaultState;
        } else {
            return pinController.getDefaultMode();
        }
    }

    public void setMode(long mode) {
        if (mode != 2) {
            if (Utils.simulation) {
                simulatedMode = mode;
            } else {
                pinController.setMode(mode == 1);
            }
        }
    }

}