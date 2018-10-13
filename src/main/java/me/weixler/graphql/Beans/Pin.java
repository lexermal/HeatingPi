package me.weixler.graphql.Beans;

public class Pin {
    private String name;
    private int id;
    private boolean activated;
    private boolean default_activated;

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
        return activated;
    }

    public void setActivated(boolean activated) {
        this.activated = activated;
    }

    public boolean isDefault_activated() {
        return default_activated;
    }

    public void setDefault_activated(boolean default_activated) {
        this.default_activated = default_activated;
    }
}
