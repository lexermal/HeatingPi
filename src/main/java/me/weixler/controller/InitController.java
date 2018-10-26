package me.weixler.controller;

import me.weixler.Utils;
import me.weixler.beans.Pin;
import me.weixler.beans.PinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class InitController {

    @Autowired
    PinRepository pindb;

    private List<Pin> pins;


    public InitController() {


    }

    @Bean
    public InitController createInitController() {

        return new InitController();
    }


    public InitController loadAll() {
        Utils.getInstance().l().info("Init creation check");

//        System.out.println(pindb.toString());

        pins = pindb.findAll();
        Utils.getInstance().l().info("Loaded all pins");

        return this;
    }

    public void createMissing() {

        List<Long> ids = new ArrayList<>();

        pins.stream().forEach(pin -> {
            ids.add(pin.getId());
        });

        int counter = 0;
        for (long i = 1; i <= 8; i++) {
            if (!ids.contains(i)) {
                Pin p = new Pin();
                p.setName("Pin " + i);
                p.setId(i);
                pindb.save(p);

                Utils.getInstance().l().info("Creating pin " + i);

                counter++;
            }
        }
        Utils.getInstance().l().info("Created " + counter + " missing pins");
    }


}
