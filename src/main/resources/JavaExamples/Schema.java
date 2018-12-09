package JavaExamples;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "schema")
public class Schema {
    @Id
    @GeneratedValue
    private long id;
    @Column
    private boolean active;
    @Column
    private String name;

    @OneToMany(mappedBy = "pin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<State> pins = new ArrayList<>();

    public Schema() {

    }

    public List<State> getStates() {
        return pins;
    }


    public List<Pin> getPins() {
        return pins.stream().map(e -> e.getPin()).collect(Collectors.toList());
    }

    public long getPinState(long pinnumber) {
        return pins.stream().filter(e -> e.getPin().getId() == pinnumber).collect(Collectors.toList()).get(0).getState();
    }

    public Schema(String name) {
        this.active = false;
        this.name = name;
    }

    public void deleteAllPins() {
        pins = new ArrayList<>();
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
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

    public void addPin(Pin pin, long statenumber) {
        State state = new State(pin, this);

        state.setState(statenumber);
        pins.add(state);
        pin.getStates().add(state);
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

    public void removeAllStats() {
        pins = new ArrayList<>();
    }
}
