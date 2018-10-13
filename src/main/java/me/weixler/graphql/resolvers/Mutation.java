package me.weixler.graphql.resolvers;

import me.weixler.graphql.Beans.Comment;
import me.weixler.graphql.Beans.Post;
import me.weixler.graphql.DataFetching.DataHolder;
import com.coxautodev.graphql.tools.GraphQLMutationResolver;
import org.springframework.stereotype.Component;

/**
 * Contains all Mutations
 */
@Component
public class Mutation implements GraphQLMutationResolver {

  public Post createPost(String text){
    return DataHolder.getInstance().addPost(text);
  }

  public Comment createComment(Long id, String text){
    return DataHolder.getInstance().addComent(id, text);
  }

}
