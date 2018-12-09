package JavaExamples;

import me.weixler.controller.PinController;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "pin")
public class Pin {
    @Id
    private long id;
    @Column
    private String name;

    @OneToMany(
            mappedBy = "schema",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )

    private List<State> schemas = new ArrayList<>();

    public List<State> getStates() {
        return schemas;
    }

    public List<Schema> getSchemas() {
        return schemas.stream().map(e -> e.getSchema()).collect(Collectors.toList());
    }

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

    public long getId() {
        return id;
    }

    public void setId(long id) {
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
