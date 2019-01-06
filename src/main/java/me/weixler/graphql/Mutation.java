package me.weixler.graphql;

import me.weixler.beans.*;
import com.coxautodev.graphql.tools.GraphQLMutationResolver;
import me.weixler.beans.DBPin;
import me.weixler.beans.DBPinMode;
import me.weixler.beans.DBSchema;
import me.weixler.beans.repos.PinRepository;
import me.weixler.beans.repos.PinModeRepository;
import me.weixler.beans.repos.SchemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

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
    PinModeRepository pinstatedb;

    @Autowired
    Authentication authentication;


    public String login(String user, String password) {
        return authentication.login(user, password);
    }

    public boolean logout() {
        return authentication.logout();
    }


    public DBPin editPin(long id, String name) {
        authentication.checkAccess("pin.edit");

        DBPin p = pindb.getOne(id);
        p.setName(name);
        pindb.save(p);

        return p;
    }

    public DBPin setPinDefaultState(long id, boolean mode) {
        authentication.checkAccess("pin.default");

        DBPin p = pindb.getOne(id);
        p.setDefaultMode(mode);
        pindb.save(p);

        return p;
    }

    public DBSchema createSchema(String name, List<InputState> inputs) {
        authentication.checkAccess("schema.create");

        DBSchema s = new DBSchema(name);

        inputs.forEach(e -> {
            DBPinMode mode = new DBPinMode(e.getMode());
            s.addDBSchemaState(mode);

            DBPin pin = pindb.getOne(e.getPinid());
            pin.addDBPinState(mode);
        });

        schemadb.save(s);

        return s;
    }

    public DBSchema editSchema(long id, String name, List<InputState> inputs) {
        authentication.checkAccess("schema.edit");

        Optional<DBSchema> result = schemadb.findById(id);

        if (result.isPresent()) {
            DBSchema dbSchema = result.get();
            dbSchema.setName(name);

            dbSchema.getDbPinModes().forEach(m -> inputs.stream().filter(i -> m.getPin().getId() == i.getPinid()).forEach(i -> m.setMode(i.getMode())));
            schemadb.save(dbSchema);

            return dbSchema;
        }
        return null;
    }

    public DBSchema editSchemaName(long id, String name) {
        authentication.checkAccess("schema.edit");

        Optional<DBSchema> result = schemadb.findById(id);

        if (result.isPresent()) {
            DBSchema dbSchema = result.get();
            dbSchema.setName(name);
            schemadb.save(dbSchema);

            if (schemadb.getAllActive().stream().anyMatch(e -> e.getId() == id)) {
                activateSchema(id);
            }

            return dbSchema;
        }
        return null;
    }

    public DBSchema deleteSchema(long id) {
        authentication.checkAccess("schema.delete");

        schemadb.findById(id).ifPresent(s -> {
            //remove all pinstates
            s.getDbPinModes().forEach(e -> removePinFromSchema(s, e.getDbPin()));
            schemadb.delete(s);
        });

        return null;
    }

    public DBSchema activateSchema(long id) {
        authentication.checkAccess("schema.activate");

        schemadb.getAllActive().forEach(e -> {
            e.setActive(false);
            schemadb.save(e);
        });

        Optional<DBSchema> result = schemadb.findById(id);

        if (result.isPresent()) {
            DBSchema s = result.get();
            s.setActive(true);

            s.getDbPinModes().stream().filter(e -> e.getMode() != 2).forEach(e -> e.getDbPin().setMode(e.getMode()));

            schemadb.save(s);

            return s;
        }
        return null;
    }


    public DBPinMode setMode(long pinid, long schemaid, long mode) {
        authentication.checkAccess("pin.mode");

        DBPinMode dbPinMode = pinstatedb.getState(schemaid, pinid);
        dbPinMode.setMode(mode);
        pinstatedb.save(dbPinMode);

        return dbPinMode;
    }

    private void removePinFromSchema(DBSchema s, DBPin p) {
        pinstatedb.delete(pinstatedb.getState(s.getId(), p.getId()));
    }

}
