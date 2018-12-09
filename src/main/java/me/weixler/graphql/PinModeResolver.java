package me.weixler.graphql;

import com.coxautodev.graphql.tools.GraphQLResolver;
import com.pi4j.io.gpio.PinMode;
import me.weixler.beans.db2.DBPin;
import me.weixler.beans.db2.DBPinMode;
import me.weixler.beans.db2.DBSchema;
import me.weixler.beans.repos.PinRepository;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.List;

/**
 * This class is for the data of the subtypes here. eg when A post a comments has
 */

@Component
class PinModeResolver implements GraphQLResolver<DBSchema> {

//    @Resource
//    private PinRepository pinRepository;

    public PinModeResolver() {

    }

//    public DBPin getPin(DBPinMode mode) {
//        return mode.getDbPin();
//    }

}
