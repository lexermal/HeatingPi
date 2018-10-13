package me.weixler.graphql.resolvers;

import me.weixler.graphql.Beans.Comment;
import me.weixler.graphql.Beans.Pin;
import me.weixler.graphql.Beans.Post;
import me.weixler.graphql.Beans.Schema;
import me.weixler.graphql.DataFetching.DataHolder;
import com.coxautodev.graphql.tools.GraphQLMutationResolver;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Contains all Mutations
 */
@Component
public class Mutation implements GraphQLMutationResolver {

    public Post createPost(String text) {
        return DataHolder.getInstance().addPost(text);
    }

    public Comment createComment(Long id, String text) {
        return DataHolder.getInstance().addComent(id, text);
    }


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
