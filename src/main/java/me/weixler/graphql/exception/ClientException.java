package me.weixler.graphql.exception;

import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ClientException extends RuntimeException implements GraphQLError {

    private Map<String, Object> extensions = new HashMap<>();

    public ClientException(String message) {
        super(message);
    }

    /**
     * Allows to return self defined variables that can help to understand the error
     *
     * @param key   name the variable should have
     * @param value
     * @return ClientException
     */
    public ClientException addAttibute(String key, Object value) {
        extensions.put(key, value);
        return this;
    }

    @Override
    public List<SourceLocation> getLocations() {
        return null;
    }

    @Override
    public Map<String, Object> getExtensions() {
        return extensions;
    }

    @Override
    public ErrorType getErrorType() {
        return ErrorType.DataFetchingException;
    }
}
