// firebase/index.js
export { db } from "./firebase";
export {
  useFirebaseStore, saveState, loadState, clearState,
  getArtists, getFirebaseError, clearFirebaseError,
  saveOneArtist, saveProject, saveArtists, deleteArtists, deleteProjectById,
  getArtistUsers, saveArtistUsers, registerArtistUser,
  getLabelUsers, saveLabelUsers,
  getMgmtUsers, saveMgmtUsers,
  startRealtimeSync, subscribeStore,
} from "./store";
