package com.guessify.model;

public enum Difficulty {
    EASY(1, 100, "Easy"),
    MEDIUM(1, 500, "Medium"),
    HARD(1, 1000, "Hard");

    private final int min;
    private final int max;
    private final String label;

    Difficulty(int min, int max, String label) {
        this.min = min;
        this.max = max;
        this.label = label;
    }

    public int getMin() {
        return min;
    }

    public int getMax() {
        return max;
    }

    public String getLabel() {
        return label;
    }

    public boolean isInRange(int value) {
        return value >= min && value <= max;
    }
}
