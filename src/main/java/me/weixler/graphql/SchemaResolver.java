package me.weixler.graphql;

import me.weixler.beans.Pin;
import me.weixler.beans.Schema;
import com.coxautodev.graphql.tools.GraphQLResolver;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * This class is for the data of the subtypes here. eg when A post a comments has
 */

@Component
class SchemaResolver implements GraphQLResolver<Schema> {
    public SchemaResolver() {

    }

    public List<Pin> getPins(Schema schema) {
        return schema.getPins();
    }

}
