package com.hms.backend.dto.auth;

import com.hms.backend.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private Long id;
    private String fullName;
    private String email;
    private Role role;
    /** Only relevant for doctors: whether an admin has approved this account yet */
    private Boolean approved;
}
