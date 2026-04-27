package com.example.course_service.presentation.http.v1.mappers;

import com.example.course_service.application.interactors.lesson.read_lesson_by_id.views.AssetView;
import com.example.course_service.application.interactors.lesson.read_lesson_by_id.views.CodingLanguageTemplateView;
import com.example.course_service.application.interactors.lesson.read_lesson_by_id.views.CodingLessonContentView;
import com.example.course_service.application.interactors.lesson.read_lesson_by_id.views.CodingTestCaseView;
import com.example.course_service.application.interactors.lesson.read_lesson_by_id.views.LessonContentView;
import com.example.course_service.application.interactors.lesson.read_lesson_by_id.views.QuizLessonContentView;
import com.example.course_service.application.interactors.lesson.read_lesson_by_id.views.QuizOptionView;
import com.example.course_service.application.interactors.lesson.read_lesson_by_id.views.QuizQuestionView;
import com.example.course_service.application.interactors.lesson.read_lesson_by_id.views.ReadLessonByIdView;
import com.example.course_service.application.interactors.lesson.read_lesson_by_id.views.TheoryLessonContentView;
import com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response.AssetResponse;
import com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response.CodingLanguageTemplateResponse;
import com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response.CodingLessonContentResponse;
import com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response.CodingTestCaseResponse;
import com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response.LessonContentResponse;
import com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response.QuizLessonContentResponse;
import com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response.QuizOptionResponse;
import com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response.QuizQuestionResponse;
import com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response.ReadLessonByIdResponse;
import com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response.TheoryLessonContentResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class LessonMapperQuery {

    public ReadLessonByIdResponse toReadLessonByIdResponse(ReadLessonByIdView readLessonByIdView) {
        return new ReadLessonByIdResponse(
                readLessonByIdView.courseId(),
                readLessonByIdView.type(),
                readLessonByIdView.title(),
                mapContent(readLessonByIdView.content()),
                mapAssets(readLessonByIdView.assets()),
                readLessonByIdView.createdAt(),
                readLessonByIdView.updatedAt()
        );
    }

    private LessonContentResponse mapContent(LessonContentView content) {
        if (Objects.isNull(content)) {
            return null;
        }

        return switch (content) {
            case TheoryLessonContentView theoryContent -> new TheoryLessonContentResponse(
                    theoryContent.markdown()
            );
            case QuizLessonContentView quizContent -> new QuizLessonContentResponse(
                    quizContent.introMarkdown(),
                    mapQuizQuestions(quizContent.questions())
            );
            case CodingLessonContentView codingContent -> new CodingLessonContentResponse(
                    codingContent.taskMarkdown(),
                    codingContent.checkerType(),
                    mapCodingLanguages(codingContent.languages()),
                    mapCodingTestCases(codingContent.testCases())
            );
        };
    }

    private List<AssetResponse> mapAssets(List<AssetView> assets) {
        if (Objects.isNull(assets)) {
            return List.of();
        }

        return assets.stream()
                .map(this::mapAsset)
                .toList();
    }

    private AssetResponse mapAsset(AssetView asset) {
        return new AssetResponse(
                asset.id(),
                asset.courseId(),
                asset.lessonId(),
                asset.type(),
                asset.storageKey(),
                asset.publicUrl(),
                asset.mimeType(),
                asset.sizeBytes(),
                asset.originalFilename(),
                asset.title(),
                asset.createdAt()
        );
    }

    private List<QuizQuestionResponse> mapQuizQuestions(List<QuizQuestionView> questions) {
        if (Objects.isNull(questions)) {
            return List.of();
        }

        return questions.stream()
                .map(this::mapQuizQuestion)
                .toList();
    }

    private QuizQuestionResponse mapQuizQuestion(QuizQuestionView question) {
        return new QuizQuestionResponse(
                question.id(),
                question.type(),
                question.text(),
                mapQuizOptions(question.options())
        );
    }

    private List<QuizOptionResponse> mapQuizOptions(List<QuizOptionView> options) {
        if (Objects.isNull(options)) {
            return List.of();
        }

        return options.stream()
                .map(this::mapQuizOption)
                .toList();
    }

    private QuizOptionResponse mapQuizOption(QuizOptionView option) {
        return new QuizOptionResponse(
                option.id(),
                option.text(),
                option.isCorrect()
        );
    }

    private List<CodingLanguageTemplateResponse> mapCodingLanguages(List<CodingLanguageTemplateView> languages) {
        if (Objects.isNull(languages)) {
            return List.of();
        }

        return languages.stream()
                .map(this::mapCodingLanguage)
                .toList();
    }

    private CodingLanguageTemplateResponse mapCodingLanguage(CodingLanguageTemplateView language) {
        return new CodingLanguageTemplateResponse(
                language.language(),
                language.starterCode()
        );
    }

    private List<CodingTestCaseResponse> mapCodingTestCases(List<CodingTestCaseView> testCases) {
        if (Objects.isNull(testCases)) {
            return List.of();
        }

        return testCases.stream()
                .map(this::mapCodingTestCase)
                .toList();
    }

    private CodingTestCaseResponse mapCodingTestCase(CodingTestCaseView testCase) {
        return new CodingTestCaseResponse(
                testCase.id(),
                testCase.isPublic(),
                testCase.input(),
                testCase.expectedOutput()
        );
    }
}
