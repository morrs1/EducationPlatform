package org.example.user_service.presentation.http.v1.user.add_finished_course;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.interactors.user.add_finished_course.AddFinishedCourseInteractor;
import org.example.user_service.presentation.http.v1.mappers.UserMapperCommand;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class AddFinishedCourseHandler {

    private final AddFinishedCourseInteractor addFinishedCourseInteractor;
    private final UserMapperCommand mapper;

    @PatchMapping("{id}/add_finished_course")
    public ResponseEntity<String> add(@PathVariable UUID id, @RequestBody AddFinishedCourseRequest request) {
        addFinishedCourseInteractor.add(mapper.toAddFinishedCourseCommand(id, request));
        return ResponseEntity.status(200).body("Update was successful");
    }

}
