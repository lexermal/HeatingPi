package me.weixler.graphql.resolvers;

import me.weixler.graphql.Beans.Comment;
import me.weixler.graphql.Beans.Post;
import me.weixler.graphql.DataFetching.DataHolder;
import com.coxautodev.graphql.tools.GraphQLResolver;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * This class is for the data of the subtypes here. eg when A post a comments has
 */

@Component
class PostResolver implements GraphQLResolver<Post> {
    public PostResolver() {

    }

    public List<Comment> getComments(Post post){
        return DataHolder.getInstance().getComments(post);
    }

}
