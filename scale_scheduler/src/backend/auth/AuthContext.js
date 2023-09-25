/**
 * Provides authentication functionalities using Firebase authentication
 * Contains the AuthContext offering authentication-related data and functions
 */

import React, { useContext, useState, useEffect } from "react"
import { auth } from "../firebase"

const AuthContext = React.createContext()

// Hook for consuming the AuthContext
export function useAuth() {
  return useContext(AuthContext)
}

// Component providing authentication functionalities to wrapped components
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState()  // Current authenticated user
  const [loading, setLoading] = useState(true)      // State for loading user data

  // Signup function: registers a user and sets their display name
  async function signup(name, email, password) {
    const res = await auth.createUserWithEmailAndPassword(email, password)
    auth.currentUser.updateProfile({ displayName: name })
    return res
  }

  // User login function
  function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password)
  }

  // User logout function
  function logout() {
    return auth.signOut()
  }

  // Send password reset email
  function resetPassword(email) {
    return auth.sendPasswordResetEmail(email)
  }

  // Update user's email
  function updateEmail(email) {
    return currentUser.updateEmail(email)
  }

  // Update user's password
  function updatePassword(password) {
    return currentUser.updatePassword(password)
  }

  // Subscribe to authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user)
      setLoading(false)
    })
    return unsubscribe  // Unsubscribe on cleanup
  }, [])

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    updateEmail,
    updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
