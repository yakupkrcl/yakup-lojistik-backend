package com.yakupProje.enums; 

public enum UserType {
    TASIYICI("ROLE_TASIYICI"),
    YUK_SAHIBI("ROLE_YUK_SAHIBI"),
    ADMIN("ROLE_ADMIN");

    private final String role;

    UserType(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }
}
