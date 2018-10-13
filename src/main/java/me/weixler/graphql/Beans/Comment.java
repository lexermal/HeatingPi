package me.weixler.graphql.Beans;


import org.apache.commons.lang3.RandomUtils;

public class Comment {

    private Long id;
    private String description;

    public Comment() {
        description = "defautl desc";
        id = RandomUtils.nextLong();
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
