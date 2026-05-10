package org.example.user_service.support.fakes;

import org.example.user_service.application.interactors.user.add_profile_photo.AddProfilePhotoCommand;
import org.example.user_service.application.interactors.user.add_profile_photo.AddProfilePhotoView;
import org.example.user_service.application.ports.PhotoStorage;

/**
 * In-memory {@link PhotoStorage}. Records the last command it received and
 * returns a configurable {@link AddProfilePhotoView}.
 */
public final class FakePhotoStorage implements PhotoStorage {

    public static final String DEFAULT_BUCKET = "user-photos";
    public static final String DEFAULT_KEY = "photo.png";
    public static final String DEFAULT_URL = "https://example.com/user-photos/photo.png";

    private final AddProfilePhotoView view;
    private AddProfilePhotoCommand lastCommand;
    private int addCalls;

    public FakePhotoStorage() {
        this(new AddProfilePhotoView(DEFAULT_BUCKET, DEFAULT_KEY, DEFAULT_URL));
    }

    public FakePhotoStorage(AddProfilePhotoView view) {
        this.view = view;
    }

    @Override
    public AddProfilePhotoView add(AddProfilePhotoCommand command) {
        addCalls++;
        lastCommand = command;
        return view;
    }

    public AddProfilePhotoCommand lastCommand() {
        return lastCommand;
    }

    public int addCalls() {
        return addCalls;
    }
}
