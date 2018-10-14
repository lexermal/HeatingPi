package me.weixler.beans;

import me.weixler.controller.PinController;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pin")
public class Pin {
    @Id
    private int id;
    private String name;
    @ManyToMany(mappedBy = "pins")
    private List<Schema> schemas = new ArrayList<>();

    public Pin() {

    }


    public Pin(int id, String name) {
        if (id < 1 || id > 8) {
            try {
                throw new Exception("The pin id is not valid:" + id);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        this.id = id;
        this.name = name;
    }

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


    @Override
    public String toString() {
        return "Pin{" + "id=" + id + ", name='" + name + '\'' + '}';
    }
}
