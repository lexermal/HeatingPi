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
    private int defaultmode;

    @OneToMany(mappedBy = "pin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DBPinState> dbPinStates = new ArrayList<>();

    public DBPin() {
    }

    public void addDBPinState(DBPinState dbPinState) {
        dbPinStates.add(dbPinState);
        dbPinState.setDbPin(this);
    }

    public void removeDBPinState(DBPinState dbPinState) {
        dbPinStates.remove(dbPinState);
        dbPinState.setDbPin(null);
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

    public int getDefaultmode() {
        return defaultmode;
    }

    public void setDefaultmode(int defaultmode) {
        this.defaultmode = defaultmode;
    }
}