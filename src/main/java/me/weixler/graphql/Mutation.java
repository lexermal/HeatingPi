package me.weixler.graphql;

import me.weixler.beans.*;
import com.coxautodev.graphql.tools.GraphQLMutationResolver;
import me.weixler.beans.db2.DBPin;
import me.weixler.beans.db2.DBPinMode;
import me.weixler.beans.db2.DBSchema;
import me.weixler.beans.repos.PinRepository;
import me.weixler.beans.repos.PinStateRepository;
import me.weixler.beans.repos.SchemaRepository;
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

    @Autowired
    PinStateRepository pinstatedb;

    public DBPin editPin(long id, String name) {
        Authentication.checkAccess("pin.edit");

        DBPin p = pindb.getOne(id);
        p.setName(name);
        pindb.save(p);

        return p;
    }

    public DBPin setPinDefaultState(long id, boolean mode) {
        Authentication.checkAccess("pin.default");

        DBPin p = pindb.getOne(id);
        p.setDefaultmode(mode);
        pindb.save(p);

        return p;
    }

    public DBSchema createSchema(String name, List<InputState> inputs) {
        Authentication.checkAccess("schema.create");

        DBSchema s = new DBSchema(name);

        inputs.forEach(e -> {
            DBPinMode mode = new DBPinMode(e.getMode());
            s.addDBSchemaState(mode);

            DBPin pin = pindb.getOne(e.getPinid());
            pin.addDBPinState(mode);

            pindb.save(pin);
        });

        return s;
    }

    public DBSchema editSchema(long id, String name, List<InputState> inputs) {
        Authentication.checkAccess("schema.edit");

        this.deleteSchema(id);
        return this.createSchema(name, inputs);
    }

    public DBSchema deleteSchema(long id) {
        Authentication.checkAccess("schema.delete");

        //remove all pinstates
        DBSchema s = schemadb.findById(id).get();
        s.getDbPinModes().forEach(e -> removePinFromSchema(s, e.getDbPin()));

        schemadb.save(s);
        schemadb.deleteById(id);

        return null;
    }

    public DBSchema activateSchema(long id) {
        Authentication.checkAccess("schema.activate");

        DBSchema s = schemadb.findById(id).get();

        s.getDbPinModes().stream().filter(e -> e.getMode() != 2).
                forEach(e -> e.getDbPin().Controller_setMode(e.getMode()));

        return s;
    }


    public DBPinMode setMode(long pinid, long schemaid, long mode) {
        Authentication.checkAccess("pin.setmode");

        DBPinMode dbPinMode = pinstatedb.getState(schemaid, pinid);
        dbPinMode.setMode(mode);
        pinstatedb.save(dbPinMode);

        return dbPinMode;
    }

    private void removePinFromSchema(DBSchema s, DBPin p) {
        DBPinMode mode = pinstatedb.getState(s.getId(), p.getId());
        s.removeDBSchemaState(mode);
        p.removeDBPinState(mode);
    }

}
