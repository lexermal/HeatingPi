package me.weixler;

import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

public class Utils {

    //allows to simulate the raspberry pi pins
//    public static boolean simulation = true;
    public static boolean simulation = !isRaspbian();

    //list of users for access
    public static Map<String, String> users = new HashMap<String, String>() {{
        put("admin", "3ba7404-4bcf-48e7-a382-85be2532ed4d");
        put("OG54H", "1234-Heizung");
    }};


    private static boolean isWindows = false;
    private static boolean isLinux = false;
    private static boolean isHpUnix = false;
    private static boolean isPiUnix = false;
    private static boolean isSolaris = false;
    private static boolean isSunOS = false;
    private static boolean archDataModel32 = false;
    private static boolean archDataModel64 = false;

    private static boolean isRaspbian() {
        final String os = System.getProperty("os.name").toLowerCase();
        if (os.contains("windows")) {
            isWindows = true;
        }
        if (os.contains("linux")) {
            isLinux = true;
        }
        if (os.contains("hp-ux")) {
            isHpUnix = true;
        }
        if (os.contains("hpux")) {
            isHpUnix = true;
        }
        if (os.contains("solaris")) {
            isSolaris = true;
        }
        if (os.contains("sunos")) {
            isSunOS = true;
        }
        if (System.getProperty("sun.arch.data.model").equals("32")) {
            archDataModel32 = true;
        }
        if (System.getProperty("sun.arch.data.model").equals("64")) {
            archDataModel64 = true;
        }
        if (isLinux) {
            final File file = new File("/etc", "os-release");
            try (FileInputStream fis = new FileInputStream(file);
                 BufferedReader br = new BufferedReader(new InputStreamReader(fis))) {
                String string;
                while ((string = br.readLine()) != null) {
                    if (string.toLowerCase().contains("raspbian")) {
                        if (string.toLowerCase().contains("name")) {
                            isPiUnix = true;
                            LoggerFactory.getLogger(Utils.class).info("Running on Raspbian");
                            return true;
                        }
                    }
                }
            } catch (final Exception e) {
                e.printStackTrace();
            }
        }
        return false;
    }

}
