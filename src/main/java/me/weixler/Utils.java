package me.weixler;

import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

public class Utils {

    //list of users for access
    //user only in lowercase
    public static Map<String, String> users = new HashMap<String, String>() {{
        put("admin", "3ba7404-4bcf-48e7-a382-85be2532ed4d");
        put("og54h", "1234-Heizung");
    }};


    public static boolean isSimulation() {
        //checks if not raspberry
        final String os = System.getProperty("os.name").toLowerCase();
        if (os.contains("linux")) {
            try (FileInputStream fis = new FileInputStream(new File("/etc", "os-release"));
                 BufferedReader br = new BufferedReader(new InputStreamReader(fis))) {
                String string;
                while ((string = br.readLine()) != null) {
                    if (string.toLowerCase().contains("raspbian") && string.toLowerCase().contains("name")) {
                        LoggerFactory.getLogger(Utils.class).info("Running on Raspbian");
                        return false;
                    }
                }
            } catch (final Exception e) {
                e.printStackTrace();
            }
        }

        return true;
    }

}
