import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import { selectCurrentViewerId, selectIsLogged } from "../../auth";
import { hydrateViewerFromUserService } from "../model/thunks";

function ViewerProfileBootstrap() {
  const dispatch = useDispatch();
  const isLogged = useSelector(selectIsLogged);
  const currentViewerId = useSelector(selectCurrentViewerId);
  const location = useLocation();
  const remoteViewerIdFromQuery = new URLSearchParams(location.search).get("id");

  useEffect(() => {
    if (!isLogged || !currentViewerId) {
      return;
    }

    dispatch(
      hydrateViewerFromUserService({
        remoteViewerId: remoteViewerIdFromQuery,
      }),
    );
  }, [dispatch, isLogged, currentViewerId, remoteViewerIdFromQuery]);

  return null;
}

export default ViewerProfileBootstrap;
