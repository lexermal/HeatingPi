package me.weixler.graphql.resolvers;

import me.weixler.beans.DBPinMode;
import me.weixler.beans.DBSchema;
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
