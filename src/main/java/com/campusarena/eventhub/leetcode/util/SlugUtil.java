package com.campusarena.eventhub.leetcode.util;

public class SlugUtil {
    public static String extractSlug(String url) {
        if (url == null || url.isEmpty()) return "";
        // Handle trailing slash
        String temp = url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
        String[] parts = temp.split("/");
        return parts[parts.length - 1];
    }
}
