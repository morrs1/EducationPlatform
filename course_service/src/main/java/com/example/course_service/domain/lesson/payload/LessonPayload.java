package com.example.course_service.domain.lesson.payload;

import com.example.course_service.domain.base.exceptions.ValidateException;

public interface LessonPayload {
    void validate() throws ValidateException;
}
