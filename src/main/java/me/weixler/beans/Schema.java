package me.weixler.beans;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Entity
@Table(name = "schema")
public class Schema {
    @Id
    @GeneratedValue
    private int id;
    @Column
    private boolean active;
    @Column
    private String name;

    @OneToMany(mappedBy = "pin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<State> pins = new ArrayList<>();

    public Schema() {

    }

    public List<State> getPins() {
        return pins;
    }

    public Schema(String name) {
        this.active = false;
        this.name = name;
    }

    public void deleteAllPins() {
        pins = new ArrayList<>();
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void addPin(Pin s) {
        State postTag = new State(s, this);
        pins.add(postTag);
        s.getSchemas().add(postTag);
    }

    public void removePin(Pin tag) {
        for (Iterator<State> iterator = pins.iterator(); iterator.hasNext(); ) {
            State postTag = iterator.next();

            if (postTag.getSchema().equals(this) && postTag.getPin().equals(tag)) {
                iterator.remove();
                postTag.getPin().getSchemas().remove(postTag);
                postTag.setSchema(null);
                postTag.setPin(null);
            }
        }
    }
}
