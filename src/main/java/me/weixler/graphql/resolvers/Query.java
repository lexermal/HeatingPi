package me.weixler.graphql.resolvers;

import me.weixler.Pin.GpioPin;
import me.weixler.Pin.PinController;
import me.weixler.graphql.Beans.Pin;
import me.weixler.graphql.Beans.Post;
import me.weixler.graphql.Beans.Schema;
import me.weixler.graphql.DataFetching.DataHolder;
import com.coxautodev.graphql.tools.GraphQLQueryResolver;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Contains all Querys
 */
@Component
class Query implements GraphQLQueryResolver {


    Post getPost(Long id) {
        return DataHolder.getInstance().getPost(id);
    }


    String example() {
        return "It's working.";
    }

    List<Pin> getPins(int id) {
//        return (GpioPin[]) PinController.getInstance().getAllLeds().toArray();pins
        Pin[] pins = {new Pin()};

        return null;
    }

    List<Schema> getSchema(int id) {
        return null;
    }


}

