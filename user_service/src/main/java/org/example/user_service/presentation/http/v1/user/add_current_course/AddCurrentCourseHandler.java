package org.example.user_service.presentation.http.v1.user.add_current_course;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.interactors.user.add_current_course.AddCurrentCourseInteractor;
import org.example.user_service.presentation.http.v1.mappers.UserMapperCommand;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class AddCurrentCourseHandler {

    private final AddCurrentCourseInteractor addCurrentCourseInteractor;
    private final UserMapperCommand mapper;

    @PatchMapping("{id}/add_current_course")
    public ResponseEntity<String> add(@PathVariable UUID id, @RequestBody AddCurrentCourseRequest request) {
        addCurrentCourseInteractor.add(mapper.toAddCurrentCourseCommand(id, request));
        return ResponseEntity.status(200).body("Update was successful");
    }

}
