package com.example.course_service.infrasructure.persistence.mappers;

import com.example.course_service.application.exceptions.InvalidLessonContentException;
import com.example.course_service.application.ports.LessonPayloadMapper;
import com.example.course_service.domain.lesson.payload.CodingLanguageTemplate;
import com.example.course_service.domain.lesson.payload.CodingLessonPayload;
import com.example.course_service.domain.lesson.payload.CodingTestCase;
import com.example.course_service.domain.lesson.payload.LessonPayload;
import com.example.course_service.domain.lesson.payload.QuizLessonPayload;
import com.example.course_service.domain.lesson.payload.QuizOption;
import com.example.course_service.domain.lesson.payload.QuizQuestion;
import com.example.course_service.domain.lesson.payload.TheoryLessonPayload;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JacksonLessonPayloadMapper implements LessonPayloadMapper {

    private final ObjectMapper objectMapper;

    public JsonNode toJson(LessonPayload payload) {
        if (Objects.isNull(payload)) {
            return objectMapper.createObjectNode();
        }

        return switch (payload) {
            case TheoryLessonPayload theoryPayload -> objectMapper.valueToTree(new TheoryContentJson(
                    theoryPayload.getMarkdown()
            ));
            case QuizLessonPayload quizPayload -> objectMapper.valueToTree(new QuizContentJson(
                    quizPayload.getIntroMarkdown(),
                    mapQuizQuestionJsons(quizPayload.getQuestions())
            ));
            case CodingLessonPayload codingPayload -> objectMapper.valueToTree(new CodingContentJson(
                    codingPayload.getTaskMarkdown(),
                    codingPayload.getCheckerType(),
                    mapLanguageTemplateJsons(codingPayload.getLanguages()),
                    mapCodingTestCaseJsons(codingPayload.getTestCases())
            ));
            default -> throw new IllegalStateException("Unsupported lesson payload type: " + payload.getClass().getName());
        };
    }

    public LessonPayload fromJson(String lessonType, JsonNode content) {
        if (content == null || content.isNull() || content.isEmpty()) {
            return null;
        }

        return switch (lessonType) {
            case "theory" -> mapTheoryPayload(content);
            case "quiz" -> mapQuizPayload(content);
            case "coding" -> mapCodingPayload(content);
            default -> throw new IllegalStateException("Unsupported lesson type for content mapping: " + lessonType);
        };
    }

    @Override
    public LessonPayload fromMap(String lessonType, Map<String, Object> content) {
        if (content == null || content.isEmpty()) {
            return null;
        }

        return fromJson(lessonType, objectMapper.valueToTree(content));
    }

    private TheoryLessonPayload mapTheoryPayload(JsonNode content) {
        var contentJson = convert(content, TheoryContentJson.class);
        return new TheoryLessonPayload(contentJson.markdown());
    }

    private QuizLessonPayload mapQuizPayload(JsonNode content) {
        var contentJson = convert(content, QuizContentJson.class);
        return new QuizLessonPayload(
                contentJson.introMarkdown(),
                mapQuizQuestions(contentJson.questions())
        );
    }

    private CodingLessonPayload mapCodingPayload(JsonNode content) {
        var contentJson = convert(content, CodingContentJson.class);
        return new CodingLessonPayload(
                contentJson.taskMarkdown(),
                contentJson.checkerType(),
                mapLanguageTemplates(contentJson.languages()),
                mapCodingTestCases(contentJson.testCases())
        );
    }

    private <T> T convert(JsonNode content, Class<T> contentClass) {
        try {
            return objectMapper.treeToValue(content, contentClass);
        } catch (JsonProcessingException e) {
            throw new InvalidLessonContentException("Lesson content does not match lesson type");
        }
    }

    private List<QuizQuestionJson> mapQuizQuestionJsons(List<QuizQuestion> questions) {
        if (Objects.isNull(questions)) {
            return new ArrayList<>();
        }

        return questions.stream()
                .map(this::mapQuizQuestionJson)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    private QuizQuestionJson mapQuizQuestionJson(QuizQuestion question) {
        return new QuizQuestionJson(
                question.getId(),
                question.getType(),
                question.getText(),
                mapQuizOptionJsons(question.getOptions())
        );
    }

    private List<QuizOptionJson> mapQuizOptionJsons(List<QuizOption> options) {
        if (Objects.isNull(options)) {
            return new ArrayList<>();
        }

        return options.stream()
                .map(this::mapQuizOptionJson)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    private QuizOptionJson mapQuizOptionJson(QuizOption option) {
        return new QuizOptionJson(
                option.getId(),
                option.getText(),
                option.getIsCorrect()
        );
    }

    private List<QuizQuestion> mapQuizQuestions(List<QuizQuestionJson> questions) {
        if (Objects.isNull(questions)) {
            return new ArrayList<>();
        }

        return questions.stream()
                .map(this::mapQuizQuestion)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    private QuizQuestion mapQuizQuestion(QuizQuestionJson question) {
        return new QuizQuestion(
                question.id(),
                question.type(),
                question.text(),
                mapQuizOptions(question.options())
        );
    }

    private List<QuizOption> mapQuizOptions(List<QuizOptionJson> options) {
        if (Objects.isNull(options)) {
            return new ArrayList<>();
        }

        return options.stream()
                .map(this::mapQuizOption)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    private QuizOption mapQuizOption(QuizOptionJson option) {
        return new QuizOption(
                option.id(),
                option.text(),
                option.isCorrect()
        );
    }

    private List<CodingLanguageTemplateJson> mapLanguageTemplateJsons(List<CodingLanguageTemplate> languages) {
        if (Objects.isNull(languages)) {
            return new ArrayList<>();
        }

        return languages.stream()
                .map(this::mapLanguageTemplateJson)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    private CodingLanguageTemplateJson mapLanguageTemplateJson(CodingLanguageTemplate language) {
        return new CodingLanguageTemplateJson(
                language.getLanguage(),
                language.getStarterCode()
        );
    }

    private List<CodingLanguageTemplate> mapLanguageTemplates(List<CodingLanguageTemplateJson> languages) {
        if (Objects.isNull(languages)) {
            return new ArrayList<>();
        }

        return languages.stream()
                .map(this::mapLanguageTemplate)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    private CodingLanguageTemplate mapLanguageTemplate(CodingLanguageTemplateJson language) {
        return new CodingLanguageTemplate(
                language.language(),
                language.starterCode()
        );
    }

    private List<CodingTestCaseJson> mapCodingTestCaseJsons(List<CodingTestCase> testCases) {
        if (Objects.isNull(testCases)) {
            return new ArrayList<>();
        }

        return testCases.stream()
                .map(this::mapCodingTestCaseJson)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    private CodingTestCaseJson mapCodingTestCaseJson(CodingTestCase testCase) {
        return new CodingTestCaseJson(
                testCase.getId(),
                testCase.getIsPublic(),
                testCase.getInput(),
                testCase.getExpectedOutput()
        );
    }

    private List<CodingTestCase> mapCodingTestCases(List<CodingTestCaseJson> testCases) {
        if (Objects.isNull(testCases)) {
            return new ArrayList<>();
        }

        return testCases.stream()
                .map(this::mapCodingTestCase)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    private CodingTestCase mapCodingTestCase(CodingTestCaseJson testCase) {
        return new CodingTestCase(
                testCase.id(),
                testCase.isPublic(),
                testCase.input(),
                testCase.expectedOutput()
        );
    }

    private record TheoryContentJson(String markdown) {
    }

    private record QuizContentJson(String introMarkdown, List<QuizQuestionJson> questions) {
    }

    private record QuizQuestionJson(UUID id, String type, String text, List<QuizOptionJson> options) {
    }

    private record QuizOptionJson(UUID id, String text, Boolean isCorrect) {
    }

    private record CodingContentJson(
            String taskMarkdown,
            String checkerType,
            List<CodingLanguageTemplateJson> languages,
            List<CodingTestCaseJson> testCases
    ) {
    }

    private record CodingLanguageTemplateJson(String language, String starterCode) {
    }

    private record CodingTestCaseJson(UUID id, Boolean isPublic, String input, String expectedOutput) {
    }
}
