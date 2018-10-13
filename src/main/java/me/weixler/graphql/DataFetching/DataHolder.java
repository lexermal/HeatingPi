package me.weixler.graphql.DataFetching;

import me.weixler.graphql.Beans.Comment;
import me.weixler.graphql.Beans.Post;

import java.util.*;

public class DataHolder {
    private static DataHolder ourInstance = new DataHolder();

    public static DataHolder getInstance() {
        return ourInstance;
    }

    Map<Long, Post> posts;
    Map<Long, Comment> comments;
    Map<Long, List<Long>> postscomments;


    private DataHolder() {
        posts = new HashMap<>();
        comments = new HashMap<>();
        postscomments = new HashMap<>();
    }

    public Post getPost(Long id) {
        return posts.get(id);
    }

    public Post addPost(String text) {
        Post post = new Post();
        post.setId(new Random().nextLong());
        post.setText(text);
        posts.put(post.getId(), post);
        postscomments.put(
                post.getId(),
                new ArrayList<>());
        return post;
    }

    public List<Comment> getComments(Post post) {
        List<Long> commentnums = postscomments.get(post.getId());
        List<Comment> commentlist = new ArrayList<>();

        if (commentnums == null) {
            return null;
        }

        for (Long i : commentnums) {
            commentlist.add(comments.get(i));
        }

        return commentlist;
    }


    public Comment addComent(long post, String text) {
        Comment comment = new Comment();
        comment.setDescription(text);
        comments.put(comment.getId(), comment);

        postscomments.get(post).add(comment.getId());

        return comment;
    }
}
