package me.weixler.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DomainController {

    @GetMapping("/schema")
    public String schema() {
        return "redirect";
    }

    @GetMapping("/pins")
    public String pins() {
        return "redirect";
    }

    @GetMapping("/active")
    public String active() {
        return "redirect";
    }

}