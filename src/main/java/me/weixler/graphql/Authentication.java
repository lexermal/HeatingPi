package me.weixler.graphql;

import me.weixler.Utils;
import me.weixler.graphql.exception.ClientException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.*;

@Component
public class Authentication {
    @Autowired
    private HttpServletRequest request;
    private UUID sessionToken;
    private LocalDateTime sessionTime;
    private Logger logger = LoggerFactory.getLogger(this.getClass());

    public void checkAccess(String permission) {
        UUID token = extractUserToken();

        if (sessionTime.plusMinutes(30).isBefore(LocalDateTime.now())) {
            generateNewToken();
        }

        if (!sessionToken.equals(token)) {
            logger.error("Someone tried to access " + permission + " from " + request.getRemoteAddr() + " with no valid token");
            logger.error("Token: " + token);

            throw new ClientException("Permission not granted");
        }

        logger.info("User " + token + " accessed " + permission + " from " + request.getRemoteAddr());
        sessionTime = LocalDateTime.now();
    }

    public String login(String user, String password) {
        boolean valid = Utils.users.containsKey(user.toLowerCase()) && Utils.users.get(user.toLowerCase()).equals(password);
        logger.info("Someone tried to login from " + request.getRemoteAddr() + ". Login successful:  " + valid);
        return valid ? getSessionToken().toString() : null;
    }

    public Authentication() {
        generateNewToken();
    }

    public UUID getSessionToken() {
        return sessionToken;
    }

    public boolean logout() {
        generateNewToken();
        return true;
    }


    private void generateNewToken() {
        logger.info("Generating sessiontoken");
        sessionTime = LocalDateTime.now();
        sessionToken = UUID.randomUUID();
    }

    private UUID extractUserToken() {
        if (request != null) {
            Enumeration headerNames = request.getHeaderNames();

            while (headerNames.hasMoreElements()) {
                String key = (String) headerNames.nextElement();

                if (key.toLowerCase().equals("authorization")) {
                    try {
                        return UUID.fromString(request.getHeader(key).replace("Bearer", "").trim());
                    } catch (Exception e) {
                        logger.error(e.getMessage());
                    }
                }
            }
        }
        return null;
    }

}