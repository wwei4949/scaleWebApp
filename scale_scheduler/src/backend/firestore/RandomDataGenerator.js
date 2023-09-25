import { uploadUserInputs } from './FirestoreCalls'

/**
 * Utility functions for generating and uploading dummy volunteer data
 */

// Generates dummy volunteer data for simulation/testing
export const generateVolunteerData = (numVolunteers = 60) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const timeSlots = [9, 10, 11, 12, 13, 14, 15]

    const volunteersData = []

    for (let i = 0; i < numVolunteers; i++) {
        const volunteerName = `dummyVolunteer${i + 1}`

        // Randomly decide if they can drive
        const isDriver = Math.random() < 0.4 ? "Yes" : "No"

        // Randomly select available days and times
        const selectedTimes = []
        const numDays = Math.floor(Math.random() * 5) + 1  // Volunteer can be available between 1 to 5 days
        const availableDays = days.sort(() => 0.5 - Math.random()).slice(0, numDays)

        for (let day of availableDays) {
            const numAvailableSlots = Math.floor(Math.random() * 3) + 1  // 1 to 3 time slots per day
            const availableSlots = timeSlots.sort(() => 0.5 - Math.random()).slice(0, numAvailableSlots)

            for (let slot of availableSlots) {
                const startHour = slot < 10 ? slot : String(slot).padStart(2, '0')
                const endHour = (slot + 1) < 10 ? (slot + 1) : String(slot + 1).padStart(2, '0')
                selectedTimes.push(`${day} ${startHour}:00-${endHour}:00`)
            }
        }

        // Randomly determine how many times they are willing to volunteer (1 to 3 times a week)
        const volunteerLimit = Math.floor(Math.random() * 3) + 1

        volunteersData.push({
            userId: `dummyUserID${i}`,
            userName: volunteerName,
            volunteerTimes: volunteerLimit,
            isDriver,
            selectedTimes
        })
    }

    return volunteersData
}

// Uploads the generated dummy volunteer data to Firestore
export const uploadGeneratedData = async () => {
    const volunteers = generateVolunteerData()

    for (let volunteer of volunteers) {
        await uploadUserInputs(volunteer.userId, volunteer.userName, volunteer.volunteerTimes, volunteer.isDriver, volunteer.selectedTimes)
    }
}
