package me.weixler.controller;

import me.weixler.beans.Pin;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.ArrayList;
import java.util.List;

@Controller
public class DomainController {


//    @GetMapping("**")
    public String greeting(@RequestParam(name = "name", required = false, defaultValue = "World") String name, Model model) {
        model.addAttribute("name", name);
        List<Pin> pins=new ArrayList<>();
        model.addAttribute("leds", pins);
        return "index";
    }

    @GetMapping("/schema")
    public String upload(@RequestParam(name = "name", required = false, defaultValue = "World") String name, Model model) {
        model.addAttribute("name", name);
        return "redirect";
    }



}