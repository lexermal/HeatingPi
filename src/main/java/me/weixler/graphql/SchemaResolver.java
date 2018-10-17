package me.weixler.graphql;

import me.weixler.beans.Pin;
import me.weixler.beans.PinRepository;
import me.weixler.beans.Schema;
import com.coxautodev.graphql.tools.GraphQLResolver;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.List;

/**
 * This class is for the data of the subtypes here. eg when A post a comments has
 */

@Component
class SchemaResolver implements GraphQLResolver<Schema> {

    @Resource
    private PinRepository pinRepository;


    public SchemaResolver() {

    }

    public List<Pin> getPins(Schema schema) {
        return pinRepository.getAllBy(schema.getId());
    }

}
