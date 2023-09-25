import React, { useState, useRef, useEffect } from "react"
import { useAuth } from "../../backend/auth/AuthContext"
import { useHistory } from "react-router-dom"
import { Button } from "react-bootstrap"
import { format } from 'date-fns'
import { uploadUserInputs, fetchUserSubmissionForNextWeek } from '../../backend/firestore/FirestoreCalls'
import './VolunteerCalendar.css'
import AdminCalendar from "./AdminCalendar"

// Define constants
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const timeSlots = Array.from({ length: 13 }, (_, i) => 9 + i * 0.5)  // 9 am to 9:30 pm in 30-minute intervals

// Volunteer view for entering availability and preferences
function VolunteerCalendar() {
  // State variables to manage the component's state
  const [selected, setSelected] = useState(new Set())
  const [tempSelected, setTempSelected] = useState(new Set())
  const isSelecting = useRef(false)
  const startCell = useRef(null)
  const selectMode = useRef('select')
  const { currentUser, logout } = useAuth()
  const [volunteerTimes, setVolunteerTimes] = useState("1")
  const [isDriver, setIsDriver] = useState("no")
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const history = useHistory()

  // Handle user logout
  async function handleLogout() {
    try {
      await logout()
      history.push("/login")
    } catch {
      console.log("Failed to log out")
    }
  }

  // Handle form submission by uploading user inputs
  const handleSubmit = async () => {
    await uploadUserInputs(currentUser.uid, currentUser.displayName, volunteerTimes, isDriver, computeSelectedTimeSlots())
    setHasSubmitted(computeSelectedTimeSlots())
  }

  // Select cells when mouse is pressed down on them
  const handleMouseDown = (day, time) => {
    isSelecting.current = true
    startCell.current = { day, time }
    selectMode.current = selected.has(`${day}-${time}`) ? 'deselect' : 'select'
    toggleTempSelected(day, time)
  }

  // Highlight cells when mouse is dragged over them
  const handleMouseOver = (day, time) => {
    if (isSelecting.current && startCell.current) {
      const { day: startDay, time: startTime } = startCell.current
      const dayIndex1 = daysOfWeek.indexOf(startDay)
      const dayIndex2 = daysOfWeek.indexOf(day)
      const timeIndex1 = timeSlots.indexOf(startTime)
      const timeIndex2 = timeSlots.indexOf(time)

      const minDayIndex = Math.min(dayIndex1, dayIndex2)
      const maxDayIndex = Math.max(dayIndex1, dayIndex2)
      const minTimeIndex = Math.min(timeIndex1, timeIndex2)
      const maxTimeIndex = Math.max(timeIndex1, timeIndex2)

      const newTempSelected = new Set()

      // Select all cells between the start cell and the current cell
      for (let di = minDayIndex; di <= maxDayIndex; di++) {
        for (let ti = minTimeIndex; ti <= maxTimeIndex; ti++) {
          const key = `${daysOfWeek[di]}-${timeSlots[ti]}`
          if (selectMode.current === 'select' || selected.has(key)) {
            newTempSelected.add(key)
          }
        }
      }

      setTempSelected(newTempSelected)
    }
  }

  // Select cells when mouse is released
  const handleMouseUp = () => {
    if (isSelecting.current) {
      const newSelected = new Set(selected)
      tempSelected.forEach(item => {
        if (selectMode.current === 'select') {
          newSelected.add(item)
        } else {
          newSelected.delete(item)
        }
      })
      setSelected(newSelected)
      setTempSelected(new Set())
      isSelecting.current = false
      startCell.current = null
    }
  }

  // Toggle cell selection
  const toggleTempSelected = (day, time) => {
    const key = `${day}-${time}`
    if (tempSelected.has(key)) {
      tempSelected.delete(key)
    } else {
      tempSelected.add(key)
    }
    setTempSelected(new Set(tempSelected))
  }

  // Determine cell class based on selection
  const getCellClass = (day, time) => {
    const key = `${day}-${time}`
    if (selected.has(key)) {
      return tempSelected.has(key) && selectMode.current === 'deselect' ? 'aboutToDeselect' : 'selected'
    } else {
      return tempSelected.has(key) ? (selectMode.current === 'select' ? 'tempSelected' : 'aboutToDeselect') : ''
    }
  }

  // Format numeric time to HH:mm
  const formatTime = time => {
    return `${Math.floor(time)}:${time % 1 ? '30' : '00'}`
  }

  // Get the date of the next Monday
  const getNextMonday = () => {
    const today = new Date()
    const daysUntilNextMonday = (1 + 7 - today.getDay()) % 7 || 7
    const nextMonday = new Date(today)
    nextMonday.setDate(today.getDate() + daysUntilNextMonday)
    return format(nextMonday, 'MMMM d, yyyy')
  }

  // Compute the selected time slots from the user's selection
  const computeSelectedTimeSlots = () => {
    const timeSlotsArr = []
    daysOfWeek.forEach(day => {
      let lastTime = -1
      let currentStart = -1
      // Iterate through all time slots for the current day
      timeSlots.forEach(time => {
        const key = `${day}-${time}`
        // If the current time slot is selected, update the start and end times
        if (selected.has(key)) {
          if (lastTime !== time - 0.5) {
            if (currentStart !== -1) {
              timeSlotsArr.push({ day, start: currentStart, end: lastTime })
            }
            currentStart = time
          }
          lastTime = time
        } else if (currentStart !== -1) {
          // If the current time slot is not selected, add the current time slot to the list of time slots
          timeSlotsArr.push({ day, start: currentStart, end: lastTime })
          currentStart = -1
        }
      })
      // Add the last time slot to the list of time slots
      if (currentStart !== -1) {
        timeSlotsArr.push({ day, start: currentStart, end: lastTime })
      }
    })
    // Format the time slots for display and storage
    return timeSlotsArr.map(slot => `${slot.day} ${formatTime(slot.start)}-${formatTime(slot.end + 0.5)}`)
  }

  // Fetch user's data for the next week when component mounts
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchUserSubmissionForNextWeek(currentUser.uid)
      if (data) {
        setSelected(new Set(data.selectedTimes || []))
        setVolunteerTimes(data.volunteerTimes)
        setIsDriver(data.isDriver)
        setHasSubmitted(true)
      }
    }
    fetchData()
  }, [currentUser.uid])

  // If the current user is an admin, display the admin calendar
  if (currentUser.uid === process.env.REACT_APP_ADMIN_UID) {
    return <AdminCalendar />
  } else {
    console.log("User UID:", currentUser.uid)
    console.log("Admin UID:", process.env.REACT_APP_ADMIN_UID)
  }

  // If the user has already submitted, display a thank you message
  if (hasSubmitted) {
    return (
      <div className="App">
        <h1> Thanks for submitting, see you next week!</h1>
        <button onClick={() => setHasSubmitted(false)}>Edit Your Response</button>
        <div className="w-100 text-center mt-2">
          <Button variant="link" onClick={handleLogout}>Log Out</Button>
        </div>
      </div>
    )
  }

  // Render the volunteer calendar and form
  return (
    <div className="App">
      <h1>Welcome back, {currentUser && currentUser.displayName}</h1>
      <h1>Week of {getNextMonday()}</h1>
      <div className="calendar-container">
        <table className="calendar" onMouseUp={handleMouseUp}>
          <thead>
            <tr>
              <th className="header">Time/Day</th>
              {daysOfWeek.map(day => (
                <th key={day} className="header">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => (
              <tr key={time}>
                <th className="header">{Math.floor(time)}:{time % 1 ? '30' : '00'}</th>
                {daysOfWeek.map(day => (
                  <td
                    key={day}
                    className={getCellClass(day, time)}
                    onMouseDown={() => handleMouseDown(day, time)}
                    onMouseOver={() => handleMouseOver(day, time)}
                  ></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="user-inputs">
          <label>
            Times per week: &nbsp;
            <input
              type="number"
              value={volunteerTimes}
              onChange={(e) => setVolunteerTimes(Number(e.target.value))}
              min="1"
              max="7"
            />
          </label>
          <div>
            <label>
              <input
                type="radio"
                value="Yes"
                checked={isDriver === "Yes"}
                onChange={() => setIsDriver("Yes")}
              />
              &nbsp; Willing to be a driver
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="No"
                checked={isDriver === "No"}
                onChange={() => setIsDriver("No")}
              />
              &nbsp; Not willing to be a driver
            </label>
          </div>
        </div>
      </div>
      <button className="submitBtn" onClick={handleSubmit}>Submit</button>
      <div className="w-100 text-center mt-2">
        <Button variant="link" onClick={handleLogout}>Log Out</Button>
      </div>
    </div>
  )
}

export default VolunteerCalendar
