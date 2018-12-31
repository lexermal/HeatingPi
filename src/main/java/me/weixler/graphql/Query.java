package me.weixler.graphql;

import me.weixler.beans.DBPin;
import me.weixler.beans.DBSchema;
import me.weixler.beans.repos.PinRepository;
import com.coxautodev.graphql.tools.GraphQLQueryResolver;
import me.weixler.beans.repos.SchemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Contains all Querys
 */
@Component
class Query implements GraphQLQueryResolver {
    @Autowired
    PinRepository pindb;

    @Autowired
    SchemaRepository schemadb;

    @Autowired
    Authentication authentication;

    String ping() {
        return "pong";
    }

    List<DBPin> getPins(long id, long schemaid) {
        authentication.checkAccess("pin.get");

        if (schemaid > 0) {
            return pindb.getAllBy(schemaid);
        }

        if (id > 0) {
            return Collections.singletonList(pindb.findById(id).orElse(null));
        }

        return new ArrayList<>(pindb.findAll());
    }

    List<DBSchema> getSchema(long id, boolean active) {
        authentication.checkAccess("schema.get");

        if (active) {
            return schemadb.getAllActive();
        }

        if (id != 0) {
            return Collections.singletonList(schemadb.findById(id).orElse(null));
        }
        return schemadb.findAll();
    }


}

