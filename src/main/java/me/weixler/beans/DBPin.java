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
    private boolean shutdownMode = false;
    @Transient
    private long simulatedMode = 0;
    @Transient
    private PinController pinController;

    @OneToMany(mappedBy = "dbPin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DBPinMode> dbPinModes = new ArrayList<>();

    public DBPin() {
        if (!Utils.simulation) {
            pinController = PinController.getInstance(1);
        }
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

    public boolean isShutdownMode() {
        return shutdownMode;
    }

    public void setShutdownMode(boolean shutdownMode) {
        this.shutdownMode = shutdownMode;
        if (!Utils.simulation) {
            pinController.setShutdownMode(shutdownMode);
        }
    }

    public boolean getDefaultMode() {
        return shutdownMode;
    }

    public void setDefaultMode(boolean defaultmode) {
        shutdownMode = defaultmode;
        if (!Utils.simulation) {
            pinController.setShutdownMode(defaultmode);
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
        return shutdownMode;
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