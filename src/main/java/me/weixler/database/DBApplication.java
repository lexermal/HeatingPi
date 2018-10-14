package me.weixler.database;

//import com.in28minutes.springboot.jpa.hibernate.h2.example.student.Student;
//import com.in28minutes.springboot.jpa.hibernate.h2.example.student.StudentRepository;

import me.weixler.database.student.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DBApplication implements CommandLineRunner {

    private Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    StudentRepository repository;

    public static void main(String[] args) {
        SpringApplication.run(DBApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {

//        logger.info("Student id 10001 -> {}", repository.findById(10001L));

//        logger.info("Inserting -> {}", repository.save(new Student("John", "A1234657")));

//        logger.info("Update 10003 -> {}", repository.save(new Student(10001L, "Name-Updated", "New-Passport")));
//        logger.info("InserCting my things -> {}", repository.save(new Student(7747L, "Schuster", "def")));

//        repository.deleteById(10002L);

        logger.info("All users -> {}", repository.findAll());


    }
}
