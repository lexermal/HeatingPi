package me.weixler.graphql;

import me.weixler.beans.Pin;
import me.weixler.beans.Schema;
import com.coxautodev.graphql.tools.GraphQLQueryResolver;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Contains all Querys
 */
@Component
class Query implements GraphQLQueryResolver {


    String example() {
        return "It's working.";
    }

    List<Pin> getPins(int id) {
        return null;
    }

    List<Schema> getSchema(int id) {
        return null;
    }


}

