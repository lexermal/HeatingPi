package hello;

import hello.upload.LedPin;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;

import java.util.Scanner;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        System.setProperty("pi4j.linking", "dynamic");
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(ApplicationContext ctx) {
        return args -> {

            System.out.println("The server is ready to use");


//            System.out.print("Choose a pin number(1-8/all): ");
//            String line = new Scanner(System.in).nextLine();
//
//            if (!line.equals("all")) {
//                new LedPin(Integer.parseInt(line)).blink();
//            } else {
//                System.out.println("--------------test all leds-------------------");
//                for (int i = 1; i <= 8; i++) {
//                    new LedPin(i).blink();
//                }
//            }

//            System.exit(1);


        };
    }

}