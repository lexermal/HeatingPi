package me.weixler.controller;

import me.weixler.beans.Pin;
import me.weixler.beans.PinRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private Logger log = LoggerFactory.getLogger(this.getClass());

    public InitController() {
    }

    @Bean
    public InitController createInitController() {
        return new InitController();
    }

    public InitController loadAll() {
        log.info("Init creation check");
        pins = pindb.findAll();
        log.info("Loaded all pins");

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

                log.info("Creating pin " + i);

                counter++;
            }
        }
        log.info("Created " + counter + " missing pins");
    }


}
