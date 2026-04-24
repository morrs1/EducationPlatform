package com.example.course_service.application.ports;

import com.example.course_service.application.interactors.asset.add_asset_to_lesson.AddAssetCommand;
import com.example.course_service.application.interactors.asset.add_asset_to_lesson.AddAssetView;

public interface AssetFileStorage {
    AddAssetView add(AddAssetCommand command);
}
