package me.weixler.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Controller
@RestController
public class DomainController {

    @GetMapping(value = {"/login", "/settings", "/schema"})
    public String redirect() {
        return "<html" +
                "<head>\n" +
                "    <title>HeizungsPi</title>\n" +
                "    <meta http-equiv=\"refresh\" content=\"0; url=/\"/>\n" +
                "</head>\n" +
                "</html>";
    }

}