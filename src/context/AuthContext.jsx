import { useCallback, useEffect, useMemo, useState } from "react";
import {
  authListener,
  getCurrentUser,
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
} from "../services/firebaseService";
import { AuthContext } from "./useAuth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = authListener(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const storedProfile = await getUser(firebaseUser.uid);
          const profile = storedProfile ? {
            ...storedProfile,
            emailVerified: firebaseUser.emailVerified,
          } : {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email,
              role: "user",
            };

          if (profile.accountStatus === "suspended") {
            await logoutUser();
            setUser(null);
            setReady(true);
            return;
          }

          setUser(profile);
        } catch {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email,
            role: "user",
          });
        }
      } else {
        setUser(null);
      }

      setReady(true);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const result = await loginUser(email, password);
    const storedProfile = await getUser(result.user.uid);
    const profile = storedProfile ? {
      ...storedProfile,
      emailVerified: result.user.emailVerified,
    } : {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || result.user.email,
        role: "user",
      };

    if (profile.accountStatus === "suspended") {
      await logoutUser();
      throw new Error("This account has been suspended. Contact an administrator.");
    }

    setUser(profile);
    return { user: profile };
  };

  const register = async (formData) => {
    const result = await registerUser(
      formData.email,
      formData.password,
      formData
    );

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

    setUser(profile);
    return { user: profile };
  };

  const signOut = async () => {
    await logoutUser();
    setUser(null);
  };

  const updateProfile = useCallback(async (data) => {
    if (!user?.uid) throw new Error("You must be signed in to update your profile.");
    const safeData = {
      name: data.name,
      phone: data.phone,
      city: data.city,
      blood: data.blood,
    };
    await updateUser(user.uid, safeData);
    setUser((current) => ({ ...current, ...safeData }));
  }, [user?.uid]);

  const value = useMemo(
    () => ({ user, ready, login, register, signOut, updateProfile }),
    [user, ready, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
