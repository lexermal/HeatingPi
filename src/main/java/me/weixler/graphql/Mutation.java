package me.weixler.graphql;

import me.weixler.beans.Pin;
import me.weixler.beans.Schema;
import com.coxautodev.graphql.tools.GraphQLMutationResolver;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Contains all Mutations
 */
@Component
public class Mutation implements GraphQLMutationResolver {

    public Pin editPin(int id, String name) {
        return null;
    }

    public Pin setPinState(int id, boolean state) {
        return null;
    }

    public Pin setPinDefaultState(int id, boolean state) {
        return null;
    }

    public Schema createSchema(String name, List<Pin> pins) {
        return null;
    }

    public Schema editSchema(int id, String name, List<Pin> pins) {
        return null;
    }

    public Schema deleteSchema(int id) {
        return null;
    }

}
