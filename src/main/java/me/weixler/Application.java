package me.weixler;

import com.coxautodev.graphql.tools.ObjectMapperConfigurer;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import me.weixler.controller.InitController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.event.EventListener;

@SpringBootApplication
public class Application extends SpringBootServletInitializer {
    @Autowired
    private InitController initController;

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(Application.class);
    }


    public static void main(String[] args) {
        System.setProperty("server.port", "9000");
        System.setProperty("pi4j.linking", "dynamic");
        SpringApplication.run(Application.class, args);
    }

    //@Fixme check if unnecessary
    @Bean
    public ObjectMapperConfigurer objectMapperConfigurer() {
        return ((mapper, mapper2) -> mapper.registerModule(new JavaTimeModule()));
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initPins() {
        Logger l = LoggerFactory.getLogger(this.getClass().getName());
        
        l.info("Initializing pins");
        initController.loadAll();
        initController.createMissingPins();
        l.info("The server is ready to use");
    }

}