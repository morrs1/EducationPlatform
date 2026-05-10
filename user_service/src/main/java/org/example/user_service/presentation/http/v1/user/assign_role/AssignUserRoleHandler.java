package org.example.user_service.presentation.http.v1.user.assign_role;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.user_service.application.interactors.user.assign_role.AssignUserRoleCommand;
import org.example.user_service.application.interactors.user.assign_role.AssignUserRoleInteractor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Operations for user management")
public class AssignUserRoleHandler {

    private final AssignUserRoleInteractor assignUserRoleInteractor;

    @PatchMapping("/{id}/assign_author")
    @Operation(summary = "Assign author role to user")
    public ResponseEntity<String> assignAuthor(@PathVariable UUID id) {
        assignUserRoleInteractor.assignAuthor(new AssignUserRoleCommand(id));
        return ResponseEntity.ok("Role AUTHOR was assigned");
    }

    @PatchMapping("/{id}/assign_admin")
    @Operation(summary = "Assign admin role to user")
    public ResponseEntity<String> assignAdmin(@PathVariable UUID id) {
        assignUserRoleInteractor.assignAdmin(new AssignUserRoleCommand(id));
        return ResponseEntity.ok("Role ADMIN was assigned");
    }
}
