package me.weixler.beans;

import me.weixler.Utils;
import me.weixler.controller.PinController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
    private boolean shutdownMode;
    @Transient
    private long simulatedMode = 0;
    @Transient
    private PinController pinController;
    @Transient
    private boolean isSimulation;

    @OneToMany(mappedBy = "dbPin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DBPinMode> dbPinModes = new ArrayList<>();

    @Transient
    private Logger logger = LoggerFactory.getLogger(this.getClass());

    public DBPin() {
        shutdownMode = false;
        isSimulation = Utils.simulation;
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
        if (!this.isSimulation) {
            pinController = PinController.getInstance(id);
            logger.info("Instantiate pin " + id);
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
        if (!this.isSimulation) {
            getPinController().setShutdownMode(shutdownMode);
        }
    }

    public boolean getDefaultMode() {
        return shutdownMode;
    }

    public void setDefaultMode(boolean defaultmode) {
        shutdownMode = defaultmode;
        if (!this.isSimulation) {
            getPinController().setShutdownMode(defaultmode);
        }
    }

    public boolean getActive() {
        if (this.isSimulation) {
            return simulatedMode == 1;
        } else {
            return getPinController().getMode();
        }
    }

    public boolean getDefaultActive() {
        return shutdownMode;
    }

    public void setMode(long mode) {
        if (mode != 2) {
            if (this.isSimulation) {
                logger.info("Set mode of pin " + id + " to " + (mode == 0 ? "off" : "on"));
                simulatedMode = mode;
            } else {
                getPinController().setMode(mode == 1);
            }
        }
    }

    private PinController getPinController() {
        if (pinController == null) {
            pinController = PinController.getInstance(this.id);
        }

        return pinController;
    }

}