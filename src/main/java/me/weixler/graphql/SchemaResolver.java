package me.weixler.graphql;

import me.weixler.beans.db2.DBPin;
import me.weixler.beans.db2.DBPinMode;
import me.weixler.beans.db2.DBSchema;
import me.weixler.beans.repos.PinRepository;
import com.coxautodev.graphql.tools.GraphQLResolver;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * This class is for the data of the subtypes here. eg when A post a comments has
 */

@Component
class SchemaResolver implements GraphQLResolver<DBSchema> {

//    @Resource
//    private PinRepository pinRepository;


    public SchemaResolver() {

    }

    public List<DBPinMode> getPins(DBSchema schema) {
        return schema.getDbPinModes();
    }

}
