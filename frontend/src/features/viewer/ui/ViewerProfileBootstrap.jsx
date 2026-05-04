import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router";
import {
  hydrateViewerFromUserService,
  hydrateViewerLearningFromLearningService,
} from "../model/thunks";

function ViewerProfileBootstrap({ isLogged = false, currentViewerId = null }) {
  const dispatch = useDispatch();
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
    dispatch(
      hydrateViewerLearningFromLearningService({
        remoteViewerId: remoteViewerIdFromQuery,
      }),
    );
  }, [dispatch, isLogged, currentViewerId, remoteViewerIdFromQuery]);

  return null;
}

export default ViewerProfileBootstrap;
