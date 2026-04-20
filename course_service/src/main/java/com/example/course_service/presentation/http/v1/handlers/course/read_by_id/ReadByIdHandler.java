package com.example.course_service.presentation.http.v1.handlers.course.read_by_id;

import com.example.course_service.application.interactors.ReadCourseByIdInteractor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/course")
@RequiredArgsConstructor
public class ReadByIdHandler {

    private final ReadCourseByIdInteractor interactor;


    @GetMapping("{id}")
    public ResponseEntity<String> readById(@PathVariable UUID id) {
        interactor.readById(id);
        return ResponseEntity.status(200).body("Success");
    }
}
