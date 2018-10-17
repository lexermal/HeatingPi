package me.weixler;

import com.coxautodev.graphql.tools.ObjectMapperConfigurer;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import me.weixler.controller.InitController;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        System.setProperty("server.port", "9000");
        System.setProperty("pi4j.linking", "dynamic");
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public ObjectMapperConfigurer objectMapperConfigurer() {
        return ((mapper, mapper2) -> mapper.registerModule(new JavaTimeModule()));
    }

    @Bean
    public CommandLineRunner commandLineRunner(ApplicationContext ctx) {
        return args -> {
            new InitController().loadAll().createMissing();
            Utils.getInstance().l().info("The Server is ready to use");
        };
    }

}