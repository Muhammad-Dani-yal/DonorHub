import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  authListener,
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
} from "../services/firebaseService";
import {
  clearAuthenticatedUser,
  mergeUserProfile,
  setAuthenticatedUser,
  setAuthReady,
} from "../features/auth/authSlice";
import { AuthContext } from "./useAuth";
import { isOwner } from "../config/access";

const buildProfile = (firebaseUser, storedProfile) => {
  const profile = storedProfile ? {
    ...storedProfile,
    emailVerified: firebaseUser.emailVerified,
  } : {
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  name: firebaseUser.displayName || firebaseUser.email,
  role: "user",
};

  return isOwner(firebaseUser.uid)
    ? { ...profile, role: "admin", accountStatus: "active", isOwner: true }
    : profile;
};

const ensureOwnerRecord = async (firebaseUser, storedProfile) => {
  if (!isOwner(firebaseUser.uid)) return;
  if (storedProfile?.role === "admin" && storedProfile?.accountStatus === "active") return;

  await updateUser(firebaseUser.uid, storedProfile ? {
    role: "admin",
    accountStatus: "active",
  } : {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email,
    email: firebaseUser.email,
    phone: "",
    city: "",
    blood: "",
    role: "admin",
    accountStatus: "active",
    createdAt: Date.now(),
  });
};

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { user, ready } = useSelector((state) => state.auth);

  useEffect(() => {
    const unsubscribe = authListener(async (firebaseUser) => {
      if (!firebaseUser) {
        dispatch(clearAuthenticatedUser());
        dispatch(setAuthReady(true));
        return;
      }

      try {
        const storedProfile = await getUser(firebaseUser.uid);
        const profile = buildProfile(firebaseUser, storedProfile);
        await ensureOwnerRecord(firebaseUser, storedProfile);
        if (profile.accountStatus === "suspended") {
          await logoutUser();
          dispatch(clearAuthenticatedUser());
        } else {
          dispatch(setAuthenticatedUser(profile));
        }
      } catch {
        dispatch(setAuthenticatedUser(buildProfile(firebaseUser, null)));
      } finally {
        dispatch(setAuthReady(true));
      }
    });

    return unsubscribe;
  }, [dispatch]);

  const login = useCallback(async (email, password) => {
    const result = await loginUser(email, password);
    const storedProfile = await getUser(result.user.uid);
    const profile = buildProfile(result.user, storedProfile);
    await ensureOwnerRecord(result.user, storedProfile);
    if (profile.accountStatus === "suspended") {
      await logoutUser();
      throw new Error("This account has been suspended. Contact an administrator.");
    }
    dispatch(setAuthenticatedUser(profile));
    return { user: profile };
  }, [dispatch]);

  const register = useCallback(async (formData) => {
    const result = await registerUser(formData.email, formData.password, formData);
    const profile = {
      uid: result.user?.uid,
      name: formData.name,
      email: formData.email,
      blood: formData.blood,
      city: formData.city,
      phone: formData.phone,
      role: "user",
      accountStatus: "active",
    };
    dispatch(setAuthenticatedUser(profile));
    return { user: profile };
  }, [dispatch]);

  const signOut = useCallback(async () => {
    await logoutUser();
    dispatch(clearAuthenticatedUser());
  }, [dispatch]);

  const updateProfile = useCallback(async (data) => {
    if (!user?.uid) throw new Error("You must be signed in to update your profile.");
    const safeData = { name: data.name, phone: data.phone, city: data.city, blood: data.blood };
    await updateUser(user.uid, safeData);
    dispatch(mergeUserProfile(safeData));
  }, [dispatch, user?.uid]);

  const value = useMemo(
    () => ({ user, ready, login, register, signOut, updateProfile }),
    [user, ready, login, register, signOut, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
