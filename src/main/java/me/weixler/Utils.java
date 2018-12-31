package me.weixler;

import java.util.HashMap;
import java.util.Map;

public class Utils {

    //allows to simulate the raspberry pi pins
    public static boolean simulation = true;

    //list of users for access
    public static Map<String, String> users=new HashMap<String, String>(){{
        put("admin","3ba7404-4bcf-48e7-a382-85be2532ed4d");
        put("user", "Test123!");
    }} ;

}
