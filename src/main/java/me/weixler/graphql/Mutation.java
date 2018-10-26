package me.weixler.graphql;

import me.weixler.beans.*;
import com.coxautodev.graphql.tools.GraphQLMutationResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Contains all Mutations
 */
@Component
public class Mutation implements GraphQLMutationResolver {
    @Autowired
    PinRepository pindb;

    @Autowired
    SchemaRepository schemadb;

    public Pin editPin(long id, String name) {
        new Authentication().accessAllowed("pin.edit");

        Pin p = pindb.getOne(id);
        p.setName(name);

        pindb.save(p);

        return p;
    }

    public Pin setPinState(long id, boolean state) {
        new Authentication().accessAllowed("pin.state");

        Pin p = pindb.getOne(id);
        p.setActivated(state);

        pindb.save(p);

        return p;
    }

    public Pin setPinDefaultState(long id, boolean state) {
        new Authentication().accessAllowed("pin.default");

        Pin p = pindb.getOne(id);
        p.setDefault_activated(state);

        pindb.save(p);

        return p;
    }

    public Schema createSchema(String name, List<InputState> inputs) {
        new Authentication().accessAllowed("schema.create");

        Schema s = new Schema(name);

        inputs.forEach(e -> s.addPin(pindb.getOne((long) e.getPinid()), e.getState()));
        schemadb.save(s);

        return s;
    }

    public Schema editSchema(long id, String name, List<InputState> inputs) {
        new Authentication().accessAllowed("schema.edit");

        this.deleteSchema(id);
        Schema s = new Schema(name);
        s.setId(id);

        inputs.forEach(e -> s.addPin(pindb.getOne((long) e.getPinid()), e.getState()));
        schemadb.save(s);

        return s;
    }

    public Schema deleteSchema(long id) {
        new Authentication().accessAllowed("schema.delete");

        Schema s = schemadb.findById(id).get();
        s.getPins().forEach(s::removePin);
        schemadb.save(s);

        System.out.println("pin remove worked");
        s.removeAllStats();
        schemadb.save(s);

        System.out.println("state remove worked");
        schemadb.deleteById(id);
        return null;
    }

    public Schema activateSchema(long id) {
        new Authentication().accessAllowed("schema.activate");

        Schema schema = schemadb.findById(id).get();

        List<Pin> pins = schema.getPins();
        pins.stream().filter(e -> schema.getPinState(e.getId()) < 2).
                forEach(e -> e.setActivated(schema.getPinState(e.getId()) == 1));

        return schema;
    }

}
