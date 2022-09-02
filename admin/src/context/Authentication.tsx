import { onAuthStateChanged } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import useAuthState from "../hooks/useAuthState";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const authState = useAuthState(auth);
  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
}

function useGetPerson() {
  const context = useContext(AuthContext);
}
