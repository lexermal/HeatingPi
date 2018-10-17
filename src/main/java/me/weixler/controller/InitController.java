package me.weixler.controller;

import me.weixler.Utils;
import me.weixler.beans.Pin;
import me.weixler.beans.PinRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    public InitController loadAll() {
        Utils.getInstance().l().info("Init creation check");

        System.out.println(pindb.toString());

        pins = pindb.findAll();
        Utils.getInstance().l().info("Loading all pins");

        return this;
    }

    public void createMissing() {

        List<Integer> ids = new ArrayList<>();

        pins.stream().forEach(pin -> {
            ids.add(pin.getId());
        });

        for (int i = 1; i <= 8; i++) {
            if (!ids.contains(i)) {
                Pin p = new Pin();
                p.setName("Pin " + i);
                p.setId(i);
                pindb.save(p);
                Utils.getInstance().l().info("Creating pin " + i);

            }
        }
        Utils.getInstance().l().info("Created all pins");
    }


}
