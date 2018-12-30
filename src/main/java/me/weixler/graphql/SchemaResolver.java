package me.weixler.graphql;

import me.weixler.beans.db2.DBPinMode;
import me.weixler.beans.db2.DBSchema;
import com.coxautodev.graphql.tools.GraphQLResolver;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * This class is for the data of the subtypes here. eg when A post a comments has
 */

@Component
class SchemaResolver implements GraphQLResolver<DBSchema> {

    public SchemaResolver() {

    }

    public List<DBPinMode> getPins(DBSchema schema) {
        return schema.getDbPinModes();
    }

}
