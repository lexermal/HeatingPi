package me.weixler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Utils {
    private static Utils ourInstance = new Utils();
    private Logger logger;
    private String lastclass;

    public static Utils getInstance() {
        return ourInstance;
    }

    private Utils() {
    }


    public Logger l() {
        String currentclass = Thread.currentThread().getStackTrace()[2].getClassName();
        if (lastclass == null || (!lastclass.equals(currentclass))) {
            logger = LoggerFactory.getLogger(currentclass);
            lastclass = currentclass;
        }
        return logger;
    }
}
