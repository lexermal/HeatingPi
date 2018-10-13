package me.weixler.graphql.Beans;

public class Post {

    private Long id;
    private String text;

    public Post() {
    }

    public Long getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public void setId(long id) {
        this.id = id;
    }
}
