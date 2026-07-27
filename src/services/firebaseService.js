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
import {
  addJsonDonor,
  addJsonRequest,
  deleteJsonDonor,
  deleteJsonRequest,
  getJsonDonors,
  getJsonRequests,
  updateJsonDonor,
  updateJsonRequest,
} from "./jsonService";

const isFirebaseReady = Boolean(auth && database);

const requireFirebase = () => {
  if (!isFirebaseReady) {
    throw new Error("Firebase is not configured. Add valid VITE_FIREBASE_* environment variables to use this application.");
  }
};

export const addDonor = async (donor) => {
  const id = donor.id || (database ? push(ref(database, "donors")).key : null) || `donor_${Date.now()}`;
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
    bloodGroup: publicDonor.blood,
    isAvailable: publicDonor.availability !== "Unavailable",
    lastDonated: publicDonor.date || "",
    userId: auth?.currentUser?.uid || null,
    approvalStatus: "Pending",
    createdAt: Date.now(),
  };

  const screening = {
    donorId: id,
    userId: auth?.currentUser?.uid || null,
    recentDisease: recentDisease || "No",
    recentDiseaseDetails: recentDiseaseDetails || "",
    hasAllergies: hasAllergies || "No",
    allergyDetails: allergyDetails || "",
    createdAt: Date.now(),
  };

  if (!isFirebaseReady) return addJsonDonor(entry);
  try {
    await update(ref(database), {
      [`donors/${id}`]: entry,
      [`donorScreenings/${id}`]: screening,
    });
  } catch {
    return addJsonDonor(entry);
  }
  return entry;
};

export const getDonors = async () => {
  if (!isFirebaseReady) return getJsonDonors();
  try {
    const snapshot = await get(ref(database, "donors"));
    return snapshot.exists() ? snapshot.val() : {};
  } catch {
    return getJsonDonors();
  }
};

export const updateDonor = async (id, donor) => {
  const normalized = {
    ...donor,
    ...(donor.blood ? { bloodGroup: donor.blood } : {}),
    ...(donor.availability ? { isAvailable: donor.availability !== "Unavailable" } : {}),
    ...(donor.date !== undefined ? { lastDonated: donor.date } : {}),
  };
  if (!isFirebaseReady) return updateJsonDonor(id, normalized);
  try {
    await update(ref(database, `donors/${id}`), normalized);
  } catch {
    return updateJsonDonor(id, normalized);
  }
};

export const deleteDonor = async (id) => {
  if (!isFirebaseReady) return deleteJsonDonor(id);
  try {
    await update(ref(database), {
      [`donors/${id}`]: null,
      [`donorScreenings/${id}`]: null,
    });
  } catch {
    return deleteJsonDonor(id);
  }
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
  const id = request.id || (database ? push(ref(database, "requests")).key : null) || `req_${Date.now()}`;
  const entry = {
    ...request,
    id,
    bloodGroup: request.blood,
    contact: request.phone,
    requestedBy: auth?.currentUser?.uid || null,
    isFulfilled: false,
    userId: auth?.currentUser?.uid || null,
    status: request.status || "Pending",
    createdAt: Date.now(),
  };

  if (!isFirebaseReady) return addJsonRequest(entry);
  try {
    await set(ref(database, `requests/${id}`), entry);
  } catch {
    return addJsonRequest(entry);
  }
  return entry;
};

export const getRequests = async () => {
  if (!isFirebaseReady) return getJsonRequests();
  try {
    const snapshot = await get(ref(database, "requests"));
    return snapshot.exists() ? snapshot.val() : {};
  } catch {
    return getJsonRequests();
  }
};

export const updateRequest = async (id, data) => {
  const normalized = {
    ...data,
    ...(data.status ? { isFulfilled: data.status === "Fulfilled" } : {}),
  };
  if (!isFirebaseReady) return updateJsonRequest(id, normalized);
  try {
    await update(ref(database, `requests/${id}`), normalized);
  } catch {
    return updateJsonRequest(id, normalized);
  }
};

export const deleteRequest = async (id) => {
  if (!isFirebaseReady) return deleteJsonRequest(id);
  try {
    await remove(ref(database, `requests/${id}`));
  } catch {
    return deleteJsonRequest(id);
  }
};

export const authListener = (callback) => {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
};
