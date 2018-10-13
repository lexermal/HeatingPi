package me.weixler.graphql.Beans;

import me.weixler.BL.PinController;

public class Pin {
    private String name;
    private int id;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public boolean isActivated() {
        return PinController.getInstance(id).getState();
    }

    public void setActivated(boolean activated) {
        PinController.getInstance(id).setState(activated);
    }

    public boolean isDefault_activated() {
        return PinController.getInstance(id).getDefaultState();
    }

    public void setDefault_activated(boolean state) {
        PinController.getInstance(id).setDefaultState(state);
    }
}
