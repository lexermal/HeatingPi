package me.weixler;

import graphql.ExceptionWhileDataFetching;
import graphql.GraphQLError;
import graphql.servlet.GraphQLErrorHandler;
import me.weixler.controller.InitController;
import me.weixler.graphql.exception.GraphQLErrorAdapter;
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

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@SpringBootApplication
public class Application extends SpringBootServletInitializer {
    @Autowired
    private InitController initController;

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(Application.class);
    }

    @Bean
    public GraphQLErrorHandler errorHandler() {
        return new GraphQLErrorHandler() {
            @Override
            public List<GraphQLError> processErrors(List<GraphQLError> errors) {
                List<GraphQLError> e = new ArrayList<>();
                e.addAll(errors.stream().filter(this::isClientError).collect(Collectors.toList()));
                e.addAll(errors.stream().filter(x -> !isClientError(x)).map(GraphQLErrorAdapter::new).collect(Collectors.toList()));
                return e;
            }

            protected boolean isClientError(GraphQLError error) {
                return !(error instanceof ExceptionWhileDataFetching || error instanceof Throwable);
            }
        };
    }

    public static void main(String[] args) {
        System.setProperty("pi4j.linking", "dynamic");
        SpringApplication.run(Application.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initPins() {
        Logger l = LoggerFactory.getLogger(Application.class);
        if (Utils.simulation) {
            l.info("The server is running in simulation mode");
        }

        l.info("Initializing pins");
        initController.loadAll();
        initController.createMissingPins();
        l.info("The server is ready to use");
    }

}