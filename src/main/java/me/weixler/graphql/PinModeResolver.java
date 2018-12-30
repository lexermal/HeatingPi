package me.weixler.graphql;

import com.coxautodev.graphql.tools.GraphQLResolver;
import me.weixler.beans.db2.DBSchema;
import org.springframework.stereotype.Component;


/**
 * This class is for the data of the subtypes here. eg when A post a comments has
 */

@Component
class PinModeResolver implements GraphQLResolver<DBSchema> {

    public PinModeResolver() {

    }

}
