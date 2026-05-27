import { Navigate, useParams } from "react-router";
import { useSelector } from "react-redux";

import { selectIsLogged } from "../../../features/auth";
import { isUuid, normalizeText } from "../../../shared/lib/gatewayValues";
import { AuthorProfileScreen } from "../../../widgets/author-profile-screen";

function UserProfilePage() {
  const { userId } = useParams();
  const isLogged = useSelector(selectIsLogged);
  const normalized = normalizeText(userId);

  if (!isUuid(normalized)) {
    return <Navigate to="/" replace />;
  }

  if (!isLogged) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="author-profile-layout">
      <main className="author-profile-layout-main">
        <AuthorProfileScreen userId={normalized} />
      </main>
    </div>
  );
}

export default UserProfilePage;
