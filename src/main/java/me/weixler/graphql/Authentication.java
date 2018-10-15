package me.weixler.graphql;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.util.Enumeration;

@Component
public class Authentication {

    @Autowired
    private HttpServletRequest request;
    private String actUserToken;

    public boolean accessAllowed(String permissionpoint) {
        init();

        //hier werden die permissions gecheckt
        if (false){
            try {
                throw new Exception("Permission not granted");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return true;
    }


    private void init() {
        actUserToken = null;

        if (request != null) {

            Enumeration headerNames = request.getHeaderNames();

            while (headerNames.hasMoreElements()) {
                String key = (String) headerNames.nextElement();

                if (key.toLowerCase().equals("authorization")) {
                    actUserToken = request.getHeader(key).replace("Bearer", "").trim();
                }
            }
        }
    }

}
