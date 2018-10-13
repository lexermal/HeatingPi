package me.weixler.Controller;

import me.weixler.BL.PinController;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@Controller
@RequestMapping("addupload")
public class EmployeeController {

    @RequestMapping("entry")
    public String handleEmployeeMessagesRequest(@RequestParam Map<String, String> queryMap, Model model) {

        System.out.println(queryMap);

        PinController.getInstance(Integer.parseInt(queryMap.get("pin"))).setState(Boolean.parseBoolean(queryMap.get("state")));

        model.addAttribute("result", "true");

        return "upload-sucessful";
    }

}