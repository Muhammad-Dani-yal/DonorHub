import {
  ref,
  push,
  set,
  get,
  update,
  remove,
  onValue,
} from "firebase/database";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
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
  const {
    recentDisease,
    recentDiseaseDetails,
    hasAllergies,
    allergyDetails,
    ...publicDonor
  } = donor;
  const entry = {
    ...publicDonor,
    id,
    userId: auth.currentUser?.uid || null,
    approvalStatus: "Pending",
    createdAt: Date.now(),
  };

  const screening = {
    donorId: id,
    userId: auth.currentUser?.uid || null,
    recentDisease: recentDisease || "No",
    recentDiseaseDetails: recentDiseaseDetails || "",
    hasAllergies: hasAllergies || "No",
    allergyDetails: allergyDetails || "",
    createdAt: Date.now(),
  };

  await update(ref(database), {
    [`donors/${id}`]: entry,
    [`donorScreenings/${id}`]: screening,
  });
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
  await update(ref(database), {
    [`donors/${id}`]: null,
    [`donorScreenings/${id}`]: null,
  });
};

export const getDonorScreenings = async () => {
  requireFirebase();
  const snapshot = await get(ref(database, "donorScreenings"));
  return snapshot.exists() ? snapshot.val() : {};
};

export const migrateLegacyDonorScreenings = async (donors) => {
  requireFirebase();
  const updates = {};
  Object.values(donors || {}).forEach((donor) => {
    const hasLegacyScreening = donor.recentDisease !== undefined || donor.hasAllergies !== undefined;
    if (!hasLegacyScreening || !donor.id) return;
    updates[`donorScreenings/${donor.id}`] = {
      donorId: donor.id,
      userId: donor.userId || null,
      recentDisease: donor.recentDisease || "No",
      recentDiseaseDetails: donor.recentDiseaseDetails || "",
      hasAllergies: donor.hasAllergies || "No",
      allergyDetails: donor.allergyDetails || "",
      createdAt: donor.createdAt || Date.now(),
    };
    updates[`donors/${donor.id}/recentDisease`] = null;
    updates[`donors/${donor.id}/recentDiseaseDetails`] = null;
    updates[`donors/${donor.id}/hasAllergies`] = null;
    updates[`donors/${donor.id}/allergyDetails`] = null;
  });
  if (Object.keys(updates).length > 0) await update(ref(database), updates);
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
    accountStatus: "active",
    createdAt: Date.now(),
  };

  await saveUserData(uid, userData);
  try {
    await sendEmailVerification(authResult.user);
  } catch {
    // Registration remains valid if the email provider temporarily rejects verification delivery.
  }
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

export const resetPassword = async (email) => {
  requireFirebase();
  await sendPasswordResetEmail(auth, email);
};

export const resendVerificationEmail = async () => {
  requireFirebase();
  if (!auth.currentUser) throw new Error("You must be signed in to verify your email.");
  await sendEmailVerification(auth.currentUser);
};

const saveUserData = async (uid, userData) => {
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

export const updateUser = async (uid, data) => {
  requireFirebase();
  await update(ref(database, `users/${uid}`), data);
};

export const addNotification = async (userId, notification) => {
  requireFirebase();
  const notificationRef = push(ref(database, `notifications/${userId}`));
  const entry = {
    id: notificationRef.key,
    type: notification.type || "info",
    title: notification.title || "DonorHub update",
    message: notification.message || "You have a new update.",
    relatedId: notification.relatedId || null,
    read: false,
    createdAt: Date.now(),
  };
  await set(notificationRef, entry);
  return entry;
};

export const subscribeToNotifications = (userId, callback) => {
  requireFirebase();
  return onValue(ref(database, `notifications/${userId}`), (snapshot) => {
    const data = snapshot.exists() ? snapshot.val() : {};
    const items = Object.values(data).sort((a, b) => b.createdAt - a.createdAt);
    callback(items);
  });
};

export const markNotificationRead = async (userId, notificationId) => {
  requireFirebase();
  await update(ref(database, `notifications/${userId}/${notificationId}`), { read: true });
};

export const markAllNotificationsRead = async (userId, notifications) => {
  requireFirebase();
  const updates = {};
  notifications.filter((item) => !item.read).forEach((item) => {
    updates[`notifications/${userId}/${item.id}/read`] = true;
  });
  if (Object.keys(updates).length > 0) await update(ref(database), updates);
};

export const getNotifications = async (userId) => {
  requireFirebase();
  const snapshot = await get(ref(database, `notifications/${userId}`));
  return snapshot.exists() ? snapshot.val() : {};
};

export const addStatusHistory = async (recordType, recordId, status, details = {}) => {
  requireFirebase();
  const historyRef = push(ref(database, `statusHistory/${recordType}/${recordId}`));
  await set(historyRef, {
    id: historyRef.key,
    status,
    changedAt: Date.now(),
    changedBy: auth.currentUser?.uid || null,
    ...details,
  });
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
