package com.hms.backend.dto.appointment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalTime;

@Getter
@Builder
@AllArgsConstructor
public class TimeSlotResponse {
    private LocalTime time;
    private boolean available;
}
