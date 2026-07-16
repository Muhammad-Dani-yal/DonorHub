import {
  ref,
  push,
  set,
  get,
  update,
  remove,
} from "firebase/database";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { database, auth } from "./firebase";

const isFirebaseReady = Boolean(auth && database);

const requireFirebase = () => {
  if (!isFirebaseReady) {
    throw new Error("Firebase is not configured. Add valid VITE_FIREBASE_* environment variables to use this application.");
  }
};

export const addDonor = async (donor) => {
  requireFirebase();

  const id = donor.id || push(ref(database, "donors")).key || `donor_${Date.now()}`;
  const entry = {
    ...donor,
    id,
    userId: auth.currentUser?.uid || null,
    createdAt: Date.now(),
  };

  await set(ref(database, `donors/${id}`), entry);
  return entry;
};

export const getDonors = async () => {
  requireFirebase();
  const snapshot = await get(ref(database, "donors"));
  return snapshot.exists() ? snapshot.val() : {};
};

export const updateDonor = async (id, donor) => {
  requireFirebase();
  await update(ref(database, `donors/${id}`), donor);
};

export const deleteDonor = async (id) => {
  requireFirebase();
  await remove(ref(database, `donors/${id}`));
};

export const registerUser = async (email, password, profile = {}) => {
  requireFirebase();

  const authResult = await createUserWithEmailAndPassword(auth, email, password);
  const uid = authResult.user.uid;
  const userData = {
    uid,
    name: profile.name || authResult.user.email,
    email,
    phone: profile.phone || "",
    city: profile.city || "",
    blood: profile.blood || "",
    role: "user",
    createdAt: Date.now(),
  };

  await saveUserData(uid, userData);
  return authResult;
};

export const loginUser = async (email, password) => {
  requireFirebase();

  const result = await signInWithEmailAndPassword(auth, email, password);
  return result;
};

export const logoutUser = async () => {
  requireFirebase();
  await signOut(auth);
};

export const saveUserData = async (uid, userData) => {
  const profile = {
    ...userData,
    uid,
    role: userData.role || "user",
    createdAt: userData.createdAt || Date.now(),
  };

  requireFirebase();
  await set(ref(database, `users/${uid}`), profile);
};

export const getUsers = async () => {
  requireFirebase();
  const snapshot = await get(ref(database, "users"));
  return snapshot.exists() ? snapshot.val() : {};
};

export const getUser = async (uid) => {
  requireFirebase();
  const snapshot = await get(ref(database, `users/${uid}`));
  return snapshot.exists() ? snapshot.val() : null;
};

export const addRequest = async (request) => {
  requireFirebase();
  const id = request.id || push(ref(database, "requests")).key || `req_${Date.now()}`;
  const entry = {
    ...request,
    id,
    userId: auth.currentUser?.uid || null,
    status: request.status || "Pending",
    createdAt: Date.now(),
  };

  await set(ref(database, `requests/${id}`), entry);
  return entry;
};

export const getRequests = async () => {
  requireFirebase();
  const snapshot = await get(ref(database, "requests"));
  return snapshot.exists() ? snapshot.val() : {};
};

export const updateRequest = async (id, data) => {
  requireFirebase();
  await update(ref(database, `requests/${id}`), data);
};

export const deleteRequest = async (id) => {
  requireFirebase();
  await remove(ref(database, `requests/${id}`));
};

export const getCurrentUser = () => auth?.currentUser || null;

export const authListener = (callback) => {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
};
