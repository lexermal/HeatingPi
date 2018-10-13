package me.weixler.database;

import java.io.File;
import java.util.List;

import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

public class UserApplication {
    private static void getAllFiles(String curDir, int ebene) {

        File[] filesList = new File(curDir).listFiles();
        for (File f : filesList) {
            if (f.isDirectory()) {
                System.out.println(new String(new char[ebene * 2]).replace("\0", " ") + f.getName());

                getAllFiles(f.getAbsolutePath(), ebene++);
            }
            if (f.isFile()) {
                System.out.println(new String(new char[ebene * 2]).replace("\0", " ") + f.getName());
            }
        }

    }

    public static void main(String[] args) {
        getAllFiles(System.getProperty("user.dir") + File.separator + "resources" , 0);
        String name;

        User user = new User();
        user.setFirstName("Genelia");
        user.setLastName("DSouza");


        SessionFactory sessionFactory = new Configuration()
                .configure(System.getProperty("user.dir") + File.separator + "resources" + File.separator + "hibernate.cfg.xml").buildSessionFactory();
//        SessionFactory sessionFactory = new Configuration().configure().buildSessionFactory();
        Session session = sessionFactory.openSession();

        session.beginTransaction();
        session.save(user);
        session.getTransaction().commit();

        session = sessionFactory.openSession();
        session.beginTransaction();
//        Query query = session.createQuery("Select  DISTINCT name from g as User");

//        List<User> list = query.list();

//        for(User user1:list){
//            name = user1.getFirstName();
//            System.out.println(name);
//        }

        session.getTransaction().commit();

    }

}