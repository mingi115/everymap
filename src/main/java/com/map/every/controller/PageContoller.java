package com.map.every.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;



@Controller
public class PageContoller {

    @GetMapping(value = "/")
    public String everymapHome(){
        return "/everymap.html";
    }
}
