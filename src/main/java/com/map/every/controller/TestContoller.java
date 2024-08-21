package com.map.every.controller;

import com.map.every.mapper.TestMapper;
import jakarta.annotation.Resource;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class TestContoller {

    @Resource(name="testMapper")
    TestMapper TestDAO;

    @GetMapping(value = "/test")
    public String test(Model model){
        System.out.println("111111111111111111111111111");
        return TestDAO.test();
    }
}
