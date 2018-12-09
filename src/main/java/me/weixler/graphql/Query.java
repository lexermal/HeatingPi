package me.weixler.graphql;

import me.weixler.beans.db2.DBPin;
import me.weixler.beans.db2.DBSchema;
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


    String ping() {
        return "pong";
    }

    List<DBPin> getPins(Long id) {
        Authentication.checkAccess("pin.get");

        if (id != null && id > 0) {
            return Collections.singletonList(pindb.findById(id).get());
        }

        return new ArrayList<>(pindb.findAll());
    }

    List<DBSchema> getSchema(long id) {
        Authentication.checkAccess("schema.get");

        if (id > 0) {
            List<DBSchema> s = new ArrayList<>();
            s.add(schemadb.findById(id).get());
            return s;
        } else return schemadb.findAll();
    }


}

