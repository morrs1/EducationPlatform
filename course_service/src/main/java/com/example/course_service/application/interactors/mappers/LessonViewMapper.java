package com.example.course_service.application.interactors.mappers;

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
import com.example.course_service.domain.asset.Asset;
import com.example.course_service.domain.lesson.Lesson;
import com.example.course_service.domain.lesson.payload.CodingLanguageTemplate;
import com.example.course_service.domain.lesson.payload.CodingLessonPayload;
import com.example.course_service.domain.lesson.payload.CodingTestCase;
import com.example.course_service.domain.lesson.payload.LessonPayload;
import com.example.course_service.domain.lesson.payload.QuizLessonPayload;
import com.example.course_service.domain.lesson.payload.QuizOption;
import com.example.course_service.domain.lesson.payload.QuizQuestion;
import com.example.course_service.domain.lesson.payload.TheoryLessonPayload;

import java.util.List;
import java.util.Objects;

public class LessonViewMapper {

    public ReadLessonByIdView toReadLessonByIdView(Lesson lesson, List<Asset> assets) {
        return new ReadLessonByIdView(
                lesson.getCourseId(),
                lesson.getType().getLessonType(),
                lesson.getTitle().getTitle(),
                mapContent(lesson.getContent()),
                mapAssets(assets),
                lesson.getCreatedAt(),
                lesson.getUpdatedAt()
        );
    }

    private LessonContentView mapContent(LessonPayload content) {
        if (Objects.isNull(content)) {
            return null;
        }

        return switch (content) {
            case TheoryLessonPayload theoryLessonPayload -> new TheoryLessonContentView(
                    theoryLessonPayload.getMarkdown()
            );
            case QuizLessonPayload quizLessonPayload -> new QuizLessonContentView(
                    quizLessonPayload.getIntroMarkdown(),
                    mapQuizQuestions(quizLessonPayload.getQuestions())
            );
            case CodingLessonPayload codingLessonPayload -> new CodingLessonContentView(
                    codingLessonPayload.getTaskMarkdown(),
                    codingLessonPayload.getCheckerType(),
                    mapCodingLanguages(codingLessonPayload.getLanguages()),
                    mapCodingTestCases(codingLessonPayload.getTestCases())
            );
            default -> throw new IllegalStateException("Unsupported lesson payload type: " + content.getClass().getName());
        };
    }

    private List<AssetView> mapAssets(List<Asset> assets) {
        if (Objects.isNull(assets)) {
            return List.of();
        }

        return assets.stream()
                .map(this::mapAsset)
                .toList();
    }

    private AssetView mapAsset(Asset asset) {
        return new AssetView(
                asset.getId(),
                asset.getCourseId(),
                asset.getLesson_id(),
                Objects.isNull(asset.getType()) ? null : asset.getType().getAssetType(),
                Objects.isNull(asset.getStorageKey()) ? null : asset.getStorageKey().getStorageKey(),
                Objects.isNull(asset.getPublicUrl()) ? null : asset.getPublicUrl().getPublicUrl(),
                Objects.isNull(asset.getMimeType()) ? null : asset.getMimeType().getMimeType(),
                Objects.isNull(asset.getSizeBytes()) ? null : asset.getSizeBytes().getSizeBytes(),
                Objects.isNull(asset.getOriginalFilename()) ? null : asset.getOriginalFilename().getOriginalFilename(),
                Objects.isNull(asset.getTitle()) ? null : asset.getTitle().getTitle(),
                asset.getCreatedAt()
        );
    }

    private List<QuizQuestionView> mapQuizQuestions(List<QuizQuestion> questions) {
        if (Objects.isNull(questions)) {
            return List.of();
        }

        return questions.stream()
                .map(this::mapQuizQuestion)
                .toList();
    }

    private QuizQuestionView mapQuizQuestion(QuizQuestion question) {
        return new QuizQuestionView(
                question.getId(),
                question.getType(),
                question.getText(),
                mapQuizOptions(question.getOptions())
        );
    }

    private List<QuizOptionView> mapQuizOptions(List<QuizOption> options) {
        if (Objects.isNull(options)) {
            return List.of();
        }

        return options.stream()
                .map(this::mapQuizOption)
                .toList();
    }

    private QuizOptionView mapQuizOption(QuizOption option) {
        return new QuizOptionView(
                option.getId(),
                option.getText(),
                option.getIsCorrect()
        );
    }

    private List<CodingLanguageTemplateView> mapCodingLanguages(List<CodingLanguageTemplate> languages) {
        if (Objects.isNull(languages)) {
            return List.of();
        }

        return languages.stream()
                .map(this::mapCodingLanguage)
                .toList();
    }

    private CodingLanguageTemplateView mapCodingLanguage(CodingLanguageTemplate language) {
        return new CodingLanguageTemplateView(
                language.getLanguage(),
                language.getStarterCode()
        );
    }

    private List<CodingTestCaseView> mapCodingTestCases(List<CodingTestCase> testCases) {
        if (Objects.isNull(testCases)) {
            return List.of();
        }

        return testCases.stream()
                .map(this::mapCodingTestCase)
                .toList();
    }

    private CodingTestCaseView mapCodingTestCase(CodingTestCase testCase) {
        return new CodingTestCaseView(
                testCase.getId(),
                testCase.getIsPublic(),
                testCase.getInput(),
                testCase.getExpectedOutput()
        );
    }
}
