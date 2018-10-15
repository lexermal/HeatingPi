package me.weixler.graphql;

import me.weixler.beans.Pin;
import me.weixler.beans.PinRepository;
import me.weixler.beans.Schema;
import com.coxautodev.graphql.tools.GraphQLMutationResolver;
import me.weixler.beans.SchemaRepository;
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

    public Schema createSchema(String name, List<Pin> pins) {
        new Authentication().accessAllowed("schema.create");

        Schema s = new Schema();
        s.setName(name);

        for (Pin p : pins) {
            s.addPin(p);
        }

        schemadb.save(s);

        return s;
    }

    public Schema editSchema(long id, String name, List<Pin> pins) {
        new Authentication().accessAllowed("schema.edit");

        Schema s = schemadb.findById(id).get();
        s.setName(name);
        s.deleteAllPins();

        for (Pin p : pins) {
            s.addPin(p);
        }

        schemadb.save(s);

        return s;
    }

    public Schema deleteSchema(long id) {
        new Authentication().accessAllowed("schema.delete");

        schemadb.deleteById(id);
        return null;
    }

}
