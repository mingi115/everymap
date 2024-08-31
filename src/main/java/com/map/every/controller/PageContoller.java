package com.map.every.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;



@Controller
public class PageContoller {

    @Value("${app.vworld.key}")
    private String vworldKey;

    @GetMapping(value = "/")
    public String everymapHome(Model model) {
        model.addAttribute("vworldKey", vworldKey);
        return "everymap";
    }
}
