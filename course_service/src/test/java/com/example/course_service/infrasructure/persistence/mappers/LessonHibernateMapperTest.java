package com.example.course_service.infrasructure.persistence.mappers;

import com.example.course_service.domain.lesson.Lesson;
import com.example.course_service.domain.lesson.payload.CodingLanguageTemplate;
import com.example.course_service.domain.lesson.payload.CodingLessonPayload;
import com.example.course_service.domain.lesson.payload.CodingTestCase;
import com.example.course_service.domain.lesson.payload.QuizLessonPayload;
import com.example.course_service.domain.lesson.payload.QuizOption;
import com.example.course_service.domain.lesson.payload.QuizQuestion;
import com.example.course_service.domain.lesson.payload.TheoryLessonPayload;
import com.example.course_service.domain.lesson.vo.LessonTitle;
import com.example.course_service.domain.lesson.vo.LessonType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNull;

class LessonHibernateMapperTest {

    private final LessonHibernateMapper mapper = new LessonHibernateMapper(new ObjectMapper());

    @Test
    void shouldMapTheoryLessonRoundTrip() {
        var lesson = new Lesson(
                UUID.randomUUID(),
                UUID.randomUUID(),
                new LessonType("theory"),
                new LessonTitle("Intro"),
                new TheoryLessonPayload("# Hello"),
                LocalDateTime.of(2026, 4, 20, 10, 0),
                LocalDateTime.of(2026, 4, 20, 11, 0)
        );

        var restoredLesson = mapper.toDomainLesson(mapper.toHibernateLesson(lesson));

        assertEquals(lesson.getId(), restoredLesson.getId());
        assertEquals(lesson.getCourseId(), restoredLesson.getCourseId());
        assertEquals("theory", restoredLesson.getType().getLessonType());
        assertEquals("Intro", restoredLesson.getTitle().getTitle());
        var payload = assertInstanceOf(TheoryLessonPayload.class, restoredLesson.getContent());
        assertEquals("# Hello", payload.getMarkdown());
    }

    @Test
    void shouldMapQuizLessonRoundTrip() {
        var lesson = new Lesson(
                UUID.randomUUID(),
                UUID.randomUUID(),
                new LessonType("quiz"),
                new LessonTitle("Quiz"),
                new QuizLessonPayload(
                        "## Questions",
                        List.of(new QuizQuestion(
                                UUID.randomUUID(),
                                "single_choice",
                                "What is Java?",
                                List.of(
                                        new QuizOption(UUID.randomUUID(), "Language", true),
                                        new QuizOption(UUID.randomUUID(), "Database", false)
                                )
                        ))
                ),
                LocalDateTime.of(2026, 4, 20, 10, 0),
                LocalDateTime.of(2026, 4, 20, 11, 0)
        );

        var restoredLesson = mapper.toDomainLesson(mapper.toHibernateLesson(lesson));

        assertEquals("quiz", restoredLesson.getType().getLessonType());
        var payload = assertInstanceOf(QuizLessonPayload.class, restoredLesson.getContent());
        assertEquals("## Questions", payload.getIntroMarkdown());
        assertEquals(1, payload.getQuestions().size());
        assertEquals("What is Java?", payload.getQuestions().getFirst().getText());
        assertEquals(2, payload.getQuestions().getFirst().getOptions().size());
        assertEquals(true, payload.getQuestions().getFirst().getOptions().getFirst().getIsCorrect());
    }

    @Test
    void shouldMapCodingLessonRoundTrip() {
        var lesson = new Lesson(
                UUID.randomUUID(),
                UUID.randomUUID(),
                new LessonType("coding"),
                new LessonTitle("Solve task"),
                new CodingLessonPayload(
                        "## Task",
                        "stdin_stdout",
                        List.of(new CodingLanguageTemplate("java", "class Main {}")),
                        List.of(new CodingTestCase(UUID.randomUUID(), true, "1", "1"))
                ),
                LocalDateTime.of(2026, 4, 20, 10, 0),
                LocalDateTime.of(2026, 4, 20, 11, 0)
        );

        var restoredLesson = mapper.toDomainLesson(mapper.toHibernateLesson(lesson));

        assertEquals("coding", restoredLesson.getType().getLessonType());
        var payload = assertInstanceOf(CodingLessonPayload.class, restoredLesson.getContent());
        assertEquals("stdin_stdout", payload.getCheckerType());
        assertEquals("java", payload.getLanguages().getFirst().getLanguage());
        assertEquals("1", payload.getTestCases().getFirst().getExpectedOutput());
    }

    @Test
    void shouldPersistEmptyJsonForLessonWithoutContent() {
        var lesson = new Lesson(
                UUID.randomUUID(),
                UUID.randomUUID(),
                new LessonType("theory"),
                new LessonTitle("Draft lesson"),
                null,
                LocalDateTime.of(2026, 4, 20, 10, 0),
                LocalDateTime.of(2026, 4, 20, 11, 0)
        );

        var hibernateLesson = mapper.toHibernateLesson(lesson);
        var restoredLesson = mapper.toDomainLesson(hibernateLesson);

        assertEquals("{}", hibernateLesson.getContent().toString());
        assertNull(restoredLesson.getContent());
    }
}
