import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  authListener,
  getCurrentUser,
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  saveUserData,
} from "../services/firebaseService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = authListener(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile =
            (await getUser(firebaseUser.uid)) || {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email,
              role: "user",
            };

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
    const profile =
      (await getUser(result.user.uid)) || {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || result.user.email,
        role: "user",
      };

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
    };

    await saveUserData(profile.uid, profile);
    setUser(profile);
    return { user: profile };
  };

  const signOut = async () => {
    await logoutUser();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, ready, login, register, signOut }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
