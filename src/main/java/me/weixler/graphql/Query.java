package me.weixler.graphql;

import com.google.common.collect.Lists;
import me.weixler.beans.Pin;
import me.weixler.beans.PinRepository;
import me.weixler.beans.Schema;
import com.coxautodev.graphql.tools.GraphQLQueryResolver;
import me.weixler.beans.SchemaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Contains all Querys
 */
@Component
class Query implements GraphQLQueryResolver {
    @Autowired
    PinRepository pindb;

    @Autowired
    SchemaRepository schemadb;


    String example() {
        return "It's working.";
    }

    List<Pin> getPins(Long id) {
        new Authentication().accessAllowed("pins.get");

        return pindb.findAll().stream().collect(Collectors.toList());

//        return (List<Pin>) (id > 0 ? pindb.findById(id) : pindb.findAll());


//        System.out.println("\n\n");
//        pindb.save(new Pin(2, "Pin 2"));
//        System.out.println("entrys:" + pindb.count());
//        System.out.println(pindb.findAll());
//
//        Logger logger = LoggerFactory.getLogger(this.getClass());


//        logger.info("Student id 10001 -> {}", repository.findById(10001L));

//        logger.info("Inserting -> {}", repository.save(new Student("John", "A1234657")));

//        logger.info("Update 10003 -> {}", repository.save(new Student(10001L, "Name-Updated", "New-Passport")));
//        logger.info("InserCting my things -> {}", repository.save(new Student(7747L, "Schuster", "def")));

//        repository.deleteById(10002L);

//        logger.info("All users -> {}", repository.findAll());


    }

    List<Schema> getSchema(long id) {
        new Authentication().accessAllowed("schema.get");

        if (id > 0) {
            List<Schema> s = new ArrayList<>();
            s.add(schemadb.findById(id).get());
            return s;
        } else return schemadb.findAll();
    }


}

