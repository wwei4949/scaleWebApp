/**
 * Firestore utility functions for handling volunteer data
 */

import { db } from '../firebase'

// Utility function to compute the date for the next Monday from today
const getNextMondayDate = () => {
  const today = new Date()
  const nextMonday = new Date(today)
  nextMonday.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7)
  return `${nextMonday.getFullYear()}-${String(nextMonday.getMonth() + 1).padStart(2, '0')}-${String(nextMonday.getDate()).padStart(2, '0')}`
};

// Upload user input data to Firestore
export const uploadUserInputs = async (userId, userName, volunteerTimes, isDriver, selectedTimes) => {
  try {
    const weekStart = getNextMondayDate();
    const userDocRef = db.collection('volunteerData').doc(`${userId}-${weekStart}`)
    await userDocRef.set({
      userName,
      volunteerTimes,
      isDriver,
      weekStart,
      selectedTimes: selectedTimes || []
    }, { merge: true })
  } catch (error) {
    console.error("Error uploading data: ", error)
  }
}

// Fetch a user's submission data for the next week from Firestore
export const fetchUserSubmissionForNextWeek = async (userId) => {
  try {
    const weekStart = getNextMondayDate()
    const userDocRef = db.collection('volunteerData').doc(`${userId}-${weekStart}`)
    const userDocSnap = await userDocRef.get()
    return userDocSnap.exists ? userDocSnap.data() : null
  } catch (error) {
    console.error("Error fetching user submission: ", error)
    return null
  }
};

// Fetch all user submissions for a specified week from Firestore
export const fetchAllSubmissionsForWeek = async (weekStart) => {
  try {
    const snapshot = await db.collection('volunteerData').where('weekStart', '==', weekStart).get();
    const data = [];
    snapshot.forEach(doc => data.push(doc.data()))
    return data;
  } catch (error) {
    console.error("Error fetching data: ", error)
    return null;
  }
}
