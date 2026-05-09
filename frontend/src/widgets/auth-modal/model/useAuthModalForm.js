import { useEffect, useRef, useState } from "react";

export function useAuthModalForm({ clearError, error }) {
  const avatarObjectUrlRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerStatus, setRegisterStatus] = useState("");
  const [registerAvatarDataUrl, setRegisterAvatarDataUrl] = useState("");
  const [registerAvatarPreviewSrc, setRegisterAvatarPreviewSrc] = useState("");
  const [registerAvatarFileName, setRegisterAvatarFileName] =
    useState("Фото не выбрано");

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
      }
    };
  }, []);

  function reset() {
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
      avatarObjectUrlRef.current = null;
    }

    setEmail("");
    setPassword("");
    setRegisterName("");
    setRegisterEmail("");
    setRegisterPassword("");
    setRegisterStatus("");
    setRegisterAvatarDataUrl("");
    setRegisterAvatarPreviewSrc("");
    setRegisterAvatarFileName("Фото не выбрано");
  }

  function clearErrorIfNeeded() {
    if (error) {
      clearError();
    }
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    clearErrorIfNeeded();

    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
    }

    const nextObjectUrl = URL.createObjectURL(file);
    avatarObjectUrlRef.current = nextObjectUrl;

    setRegisterAvatarPreviewSrc(nextObjectUrl);
    setRegisterAvatarFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setRegisterAvatarDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  return {
    login: {
      email,
      password,
      setEmail: (value) => {
        clearErrorIfNeeded();
        setEmail(value);
      },
      setPassword: (value) => {
        clearErrorIfNeeded();
        setPassword(value);
      },
    },
    register: {
      avatarDataUrl: registerAvatarDataUrl,
      avatarFileName: registerAvatarFileName,
      avatarPreviewSrc: registerAvatarPreviewSrc,
      email: registerEmail,
      name: registerName,
      password: registerPassword,
      status: registerStatus,
      handleAvatarChange,
      setEmail: (value) => {
        clearErrorIfNeeded();
        setRegisterEmail(value);
      },
      setName: (value) => {
        clearErrorIfNeeded();
        setRegisterName(value);
      },
      setPassword: (value) => {
        clearErrorIfNeeded();
        setRegisterPassword(value);
      },
      setStatus: (value) => {
        clearErrorIfNeeded();
        setRegisterStatus(value);
      },
    },
    reset,
  };
}
