package me.weixler.controller;

import me.weixler.beans.db2.DBPin;
import me.weixler.beans.repos.PinRepository;
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

    private List<DBPin> pins;
    private Logger log = LoggerFactory.getLogger(this.getClass());

    public InitController() {
    }

    @Bean
    public InitController createInitController() {
        return new InitController();
    }

    public void loadAll() {
        pins = pindb.findAll();
        log.info("Loaded all pins...");
    }

    public void createMissingPins() {
        List<Long> ids = new ArrayList<>();

        pins.forEach(pin -> ids.add(pin.getId()));

        for (long i = 1; i <= 8; i++) {
            if (!ids.contains(i)) {
                DBPin p = new DBPin();
                p.setName("Pin " + i);
                p.setId(i);
                pindb.save(p);

                log.info("Created missing pin " + i);
            }
        }
    }


}
