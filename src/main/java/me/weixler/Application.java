package me.weixler;

import com.coxautodev.graphql.tools.ObjectMapperConfigurer;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import me.weixler.controller.InitController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.event.EventListener;

@SpringBootApplication
public class Application {
    @Autowired
    private InitController initController;


    public static void main(String[] args) {
        System.setProperty("server.port", "9000");
        System.setProperty("pi4j.linking", "dynamic");
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public ObjectMapperConfigurer objectMapperConfigurer() {
        return ((mapper, mapper2) -> mapper.registerModule(new JavaTimeModule()));
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initPins() {
        Utils.getInstance().l().info("Initialisation of all pins started");
        initController.loadAll().createMissing();
        Utils.getInstance().l().info("The pin Initialisation finished");
        Utils.getInstance().l().info("The Server is now ready to use");
    }

}