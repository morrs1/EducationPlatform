import { useState } from "react";

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = [
  { label: "Пн", row: 1 },
  { label: "Ср", row: 3 },
  { label: "Пт", row: 5 },
];
const MONTH_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  month: "short",
  timeZone: "UTC",
});
const DATE_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function createUtcDate(year, month, day) {
  return new Date(Date.UTC(year, month, day));
}

function addDays(date, days) {
  return new Date(date.getTime() + days * MS_IN_DAY);
}

function getMondayIndex(date) {
  return (date.getUTCDay() + 6) % 7;
}

function getWeekIndex(startDate, currentDate) {
  return Math.floor(
    (currentDate.getTime() - startDate.getTime()) / MS_IN_DAY / 7,
  );
}

function getPlural(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return one;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return few;
  }

  return many;
}

function buildActivityCalendar() {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const today = createUtcDate(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const yearStart = createUtcDate(currentYear, 0, 1);
  const yearEnd = createUtcDate(currentYear, 11, 31);
  const calendarStart = addDays(yearStart, -getMondayIndex(yearStart));
  const calendarEnd = addDays(yearEnd, 6 - getMondayIndex(yearEnd));
  const days = [];
  const monthLabels = [];

  for (
    let currentDate = calendarStart;
    currentDate <= calendarEnd;
    currentDate = addDays(currentDate, 1)
  ) {
    const isInYear = currentDate >= yearStart && currentDate <= yearEnd;
    const weekIndex = getWeekIndex(calendarStart, currentDate);

    if (isInYear && currentDate.getUTCDate() === 1) {
      monthLabels.push({
        label: MONTH_FORMATTER.format(currentDate).replace(".", ""),
        weekIndex,
      });
    }

    if (!isInYear) {
      days.push({
        id: currentDate.toISOString(),
        isPlaceholder: true,
        weekIndex,
        weekdayIndex: getMondayIndex(currentDate),
      });
      continue;
    }

    days.push({
      id: currentDate.toISOString(),
      dateLabel: DATE_FORMATTER.format(currentDate),
      isPlaceholder: false,
      isToday: currentDate.getTime() === today.getTime(),
      weekIndex,
      weekdayIndex: getMondayIndex(currentDate),
      solved: 0,
      lessons: 0,
      minutes: 0,
      level: 0,
    });
  }

  const totalColumns = Math.max(...days.map((day) => day.weekIndex)) + 1;
  const dayMap = new Map(
    days.map((day) => [`${day.weekIndex}-${day.weekdayIndex}`, day]),
  );
  const columns = Array.from({ length: totalColumns }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, weekdayIndex) => {
      return (
        dayMap.get(`${weekIndex}-${weekdayIndex}`) ?? {
          id: `empty-${weekIndex}-${weekdayIndex}`,
          isPlaceholder: true,
          weekIndex,
          weekdayIndex,
        }
      );
    }),
  );

  return {
    currentYear,
    columns,
    monthLabels,
    totalColumns,
    summary: {
      activeDays: 0,
      currentStreak: 0,
      totalSolved: 0,
      longestStreak: 0,
    },
  };
}

function ProfileActivity() {
  const activity = buildActivityCalendar();
  const [tooltip, setTooltip] = useState(null);
  const tooltipWidth = 224;
  const tooltipGap = 16;

  const summaryText = `${activity.summary.activeDays} ${getPlural(
    activity.summary.activeDays,
    "активный день",
    "активных дня",
    "активных дней",
  )} в ${activity.currentYear} году`;

  function showTooltip(day, event) {
    const section = event.currentTarget.closest(".profile-activity");

    if (!section) {
      setTooltip({ day, left: "50%", top: 0 });
      return;
    }

    const cellRect = event.currentTarget.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const rawLeft = cellRect.left - sectionRect.left + cellRect.width / 2;
    const top = cellRect.top - sectionRect.top - 12;
    const minLeft = tooltipWidth / 2 + tooltipGap;
    const maxLeft = sectionRect.width - tooltipWidth / 2 - tooltipGap;
    const left = Math.min(Math.max(rawLeft, minLeft), maxLeft);

    setTooltip({
      day,
      left: `${left}px`,
      top: `${top}px`,
    });
  }

  return (
    <section className="profile-activity">
      {tooltip ? (
        <div
          className="profile-activity-tooltip-popup"
          role="status"
          aria-live="polite"
          style={{
            left: tooltip.left,
            top: tooltip.top,
          }}
        >
          <strong>{tooltip.day.dateLabel}</strong>
          <span>
            {tooltip.day.solved}{" "}
            {getPlural(
              tooltip.day.solved,
              "решённая задача",
              "решённые задачи",
              "решённых задач",
            )}
          </span>
          <span>
            {tooltip.day.lessons}{" "}
            {getPlural(tooltip.day.lessons, "урок", "урока", "уроков")} и{" "}
            {tooltip.day.minutes} мин практики
          </span>
        </div>
      ) : null}

      <div className="profile-activity-header">
        <div>
          <span className="profile-activity-label">АКТИВНОСТЬ</span>
          <h2 className="profile-activity-title">
            Активность за {activity.currentYear} год
          </h2>
        </div>

        <p className="profile-activity-summary">{summaryText}</p>
      </div>

      <div className="profile-activity-board">
        <div className="profile-activity-calendar">
          <div className="profile-activity-months">
            {activity.monthLabels.map((month) => (
              <span
                key={`${month.label}-${month.weekIndex}`}
                style={{ gridColumnStart: month.weekIndex + 1 }}
              >
                {month.label}
              </span>
            ))}
          </div>

          <div className="profile-activity-grid-wrap">
            <div className="profile-activity-weekdays">
              {WEEKDAY_LABELS.map((day) => (
                <span key={day.label} style={{ gridRow: day.row }}>
                  {day.label}
                </span>
              ))}
            </div>

            <div
              className="profile-activity-grid"
              style={{
                gridTemplateColumns: `repeat(${activity.totalColumns}, minmax(0, 1fr))`,
              }}
            >
              {activity.columns.map((column, columnIndex) => (
                <div
                  key={`column-${columnIndex}`}
                  className="profile-activity-column"
                >
                  {column.map((day) => {
                    if (day.isPlaceholder) {
                      return (
                        <span
                          key={day.id}
                          className="profile-activity-cell profile-activity-cell-placeholder"
                          aria-hidden="true"
                        />
                      );
                    }

                    const isHovered = tooltip?.day.id === day.id;
                    const ariaLabel = `${day.dateLabel}: ${day.solved} ${getPlural(
                      day.solved,
                      "решённая задача",
                      "решённые задачи",
                      "решённых задач",
                    )}, ${day.lessons} ${getPlural(
                      day.lessons,
                      "урок",
                      "урока",
                      "уроков",
                    )}`;

                    return (
                      <button
                        key={day.id}
                        type="button"
                        className={`profile-activity-cell profile-activity-cell-button level-${day.level}${isHovered ? " is-active" : ""}${day.isToday ? " is-today" : ""}`}
                        onMouseEnter={(event) => showTooltip(day, event)}
                        onMouseLeave={() => setTooltip(null)}
                        onFocus={(event) => showTooltip(day, event)}
                        onBlur={() => setTooltip(null)}
                        aria-label={ariaLabel}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="profile-activity-board-meta">
          <span className="profile-activity-next-day">
            Следующий день в 00:00 UTC
          </span>
        </div>
      </div>

      <div className="profile-activity-footer">
        <div className="profile-activity-metric">
          <strong>{activity.summary.currentStreak}</strong>
          <span>дней без перерыва</span>
        </div>

        <div className="profile-activity-metric">
          <strong>{activity.summary.longestStreak}</strong>
          <span>дней без перерыва (макс.)</span>
        </div>

        <div className="profile-activity-metric">
          <strong>{activity.summary.totalSolved}</strong>
          <span>задач решено</span>
        </div>
      </div>

      <div className="profile-activity-scale" aria-hidden="true">
        <span className="profile-activity-footer-text">Меньше</span>
        <div className="profile-activity-legend">
          {[0, 1, 2, 3].map((level) => (
            <span
              key={level}
              className={`profile-activity-cell level-${level}`}
            />
          ))}
        </div>
        <span className="profile-activity-footer-text">Больше</span>
      </div>
    </section>
  );
}

export default ProfileActivity;
