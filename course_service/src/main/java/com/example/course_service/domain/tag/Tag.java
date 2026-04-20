package com.example.course_service.domain.tag;

import com.example.course_service.domain.base.BaseEntity;
import com.example.course_service.domain.course.vo.TagName;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.UUID;

@Getter
@Setter
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
public class Tag extends BaseEntity {

    private TagName name;

    public Tag(UUID id, TagName name) {
        super(id);
        this.name = name;
    }
}
