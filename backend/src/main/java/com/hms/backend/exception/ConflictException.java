package com.hms.backend.exception;

/** Thrown when a request conflicts with current state, e.g. a slot that just got booked */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
