package me.weixler.beans;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "schema")
public class Schema {
    @Id
    @GeneratedValue
    private int id;
    private boolean active;
    private String name;
    @ManyToMany(cascade = {CascadeType.ALL})
    @JoinTable(
            name = "schema_pins",
            joinColumns = {@JoinColumn(name = "schema_id")},
            inverseJoinColumns = {@JoinColumn(name = "pins_id")}
    )
    private List<Pin> pins = new ArrayList<>();

    public Schema() {

    }


    public Schema(String name) {
        this.active = false;
        this.name = name;
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
}
