package org.example.learning_service.domain.enrollment.vo;

import lombok.Getter;
import org.example.learning_service.domain.base.BaseValueObject;
import org.example.learning_service.domain.base.exceptions.ValidateException;

import java.util.Set;

@Getter
public class EnrollmentStatus extends BaseValueObject {

    /** Курс начат или идёт, завершён ещё не зафиксирован. */
    public static final String IN_PROGRESS = "in_progress";

    /** Курс официально завершён для пользователя. */
    public static final String COMPLETED = "completed";

    private static final Set<String> ALLOWED = Set.of(IN_PROGRESS, COMPLETED);

    private final String value;

    public EnrollmentStatus(String value) {
        this.value = value == null ? "" : value.trim();
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (value.isEmpty()) {
            throw new ValidateException("Enrollment status must not be blank");
        }
        if (!ALLOWED.contains(value)) {
            throw new ValidateException("Unsupported enrollment status: " + value + " (allowed: in_progress, completed)");
        }
    }

    @Override
    public String toString() {
        return value;
    }
}
