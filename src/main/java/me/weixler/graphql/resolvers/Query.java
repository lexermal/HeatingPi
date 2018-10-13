package me.weixler.graphql.resolvers;

import me.weixler.graphql.Beans.Post;
import me.weixler.graphql.DataFetching.DataHolder;
import com.coxautodev.graphql.tools.GraphQLQueryResolver;
import org.springframework.stereotype.Component;

/**
 * Contains all Querys
 */
@Component
class Query implements GraphQLQueryResolver {


    Post getPost(Long id) {
        return DataHolder.getInstance().getPost(id);
    }


    String example() {
        return "Hello World";
    }
}

