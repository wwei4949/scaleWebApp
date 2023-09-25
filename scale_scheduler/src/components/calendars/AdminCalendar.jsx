import React, { useState, useEffect } from 'react'
import { fetchAllSubmissionsForWeek } from '../../backend/firestore/FirestoreCalls'
import { uploadGeneratedData } from '../../backend/firestore/RandomDataGenerator'
import { useAuth } from "../../backend/auth/AuthContext"
import { useHistory } from "react-router-dom"
import { Button } from "react-bootstrap"
import './AdminCalendar.css'

// Admin view for scheduling volunteers
function AdminCalendar() {
  const history = useHistory()

  // State variables
  const [heatMapData, setHeatMapData] = useState({})
  const [maxCount, setMaxCount] = useState(0)
  const mondays = getMondaysList()
  const [selectedWeek, setSelectedWeek] = useState(mondays[0])
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const timeSlots = Array.from({ length: 13 }, (_, i) => 9 + i * 0.5)
  const [optimizedSchedule, setOptimizedSchedule] = useState({})
  const [allVolunteers, setAllVolunteers] = useState([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [timeSlotVolunteersMap, setTimeSlotVolunteersMap] = useState({})
  const [volunteersForSelectedSlot, setVolunteersForSelectedSlot] = useState([])

  const { currentUser, logout } = useAuth()

  // Volunteer class to represent individual volunteers
  class Volunteer {
    constructor(uid, name, availability, canDrive, maxEvents) {
      this.uid = uid
      this.name = name
      this.availability = availability
      this.canDrive = canDrive === "Yes"
      this.maxEvents = Number(maxEvents)
      this.eventsAssigned = 0
    }
  }

  // Utility function to format a date as YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')  // +1 since months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Function to get the list of mondays
  function getMondaysList() {
    const today = new Date();
    const daysUntilNextMonday = (1 + 7 - today.getDay()) % 7 || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilNextMonday);

    const thisMonday = new Date(nextMonday);
    thisMonday.setDate(nextMonday.getDate() - 7);

    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(thisMonday.getDate() - 7);

    const lastLastMonday = new Date(lastMonday);
    lastLastMonday.setDate(lastMonday.getDate() - 7);

    return [formatDate(nextMonday), formatDate(thisMonday), formatDate(lastMonday), formatDate(lastLastMonday)];
  }

  // Function to split a time slot into two 30-minute segments
  const get30MinSegments = (timeSlot) => {
    const [day, time] = timeSlot.split(' ')
    const [start, end] = time.split('-')
    const [startHour] = start.split(':').map(Number)
    const formatHour = (hour) => hour < 10 ? `${hour}` : String(hour).padStart(2, '0')
    const nextHour = startHour + 1
    const segments = []
    segments.push(`${day} ${formatHour(startHour)}:00-${formatHour(startHour)}:30`)
    segments.push(`${day} ${formatHour(startHour)}:30-${formatHour(nextHour)}:00`)
    return segments
  }

  // Fetch all submissions for the selected week when the selected week changes
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAllSubmissionsForWeek(selectedWeek)
      const heatmap = {
        "Monday 09:00-09:30": 0,
      }
      const volunteersMap = {}
      data.forEach(submission => {
        submission.selectedTimes.forEach(time => {
          const segments = get30MinSegments(time)
          segments.forEach(segment => {
            if (!heatmap[segment]) heatmap[segment] = 0
            heatmap[segment]++
            if (!volunteersMap[segment]) volunteersMap[segment] = []
            volunteersMap[segment].push(submission.userName)
          })
        })
      })
      const maxCount = Math.max(...Object.values(heatmap))
      setMaxCount(maxCount)
      setHeatMapData(heatmap)
      setTimeSlotVolunteersMap(volunteersMap)
    }
    fetchData()
  }, [selectedWeek])

  // Fetch all volunteers for the selected week when the selected week changes
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAllSubmissionsForWeek(selectedWeek)
      const volunteers = data.map(submission => {
        return new Volunteer(
          submission.uid,
          submission.userName,
          submission.selectedTimes,
          submission.isDriver,
          submission.volunteerTimes
        )
      })
      setAllVolunteers(volunteers)
    }
    fetchData()
  }, [selectedWeek])

  // Determine the color to be displayed for a specific slot in the heatmap
  const getColorForSlot = (slot) => {
    const [day, timeRange] = slot.split(' ')
    const [start, end] = timeRange.split('-')
    const keys = Object.keys(optimizedSchedule)
    const comp1Keys = keys.filter(key => key.includes(`Competition 1 Volunteers on ${day}`) && (key.includes(`${start}-`) || key.includes(`-${end}`)))
    const comp2Keys = keys.filter(key => key.includes(`Competition 2 Volunteers on ${day}`) && (key.includes(`${start}-`) || key.includes(`-${end}`)))
    
    // If the slot is assigned to a competition, show the competition color
    if (comp1Keys.length > 0) {
      return 'yellow'
    } else if (comp2Keys.length > 0) {
      return 'purple'
    } else {
      // Otherwise, generate colors increasing in intensity based on the number of volunteers available for the slot
      const count = heatMapData[slot] || 0
      const ratio = count / maxCount
      const startColor = [255, 182, 193]
      const endColor = [60, 0, 0]
      const interpolatedColor = startColor.map((start, index) =>
        Math.round(start + (endColor[index] - start) * ratio)
      )
      return `rgb(${interpolatedColor.join(",")})`
    }
  }

  // Format a numeric time into a string format
  const formatTime = time => `${Math.floor(time)}:${time % 1 ? '30' : '00'}`

  // Function to optimize the schedule when the Optimize button is clicked
  const handleOptimizeClick = async () => {
    try {
      const response = await fetch("http://localhost:5000/optimize-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ volunteers: allVolunteers })
      })
      const result = await response.json()
      setOptimizedSchedule(result)
    } catch (error) {
      console.error("Error fetching data: ", error)
    }
  }

  // Function to generate and upload dummy data for testing purposes
  const handleGenerateDummyData = async () => {
    await uploadGeneratedData()
  }

  // Handle user logout
  async function handleLogout() {
    try {
      await logout()
      history.push("/login")
    } catch {
      console.log("Failed to log out")
    }
  }

  // Function to show list of volunteers available for a specific time slot on the calendar when the slot is clicked
  const handleTimeSlotClick = (slot) => {
    const [day, timeRange] = slot.split(' ')
    const [start, end] = timeRange.split('-')
    const keys = Object.keys(optimizedSchedule)
    const comp1Keys = keys.filter(key => key.includes(`Competition 1 Volunteers on ${day}`) && (key.includes(`${start}-`) || key.includes(`-${end}`)))
    const comp2Keys = keys.filter(key => key.includes(`Competition 2 Volunteers on ${day}`) && (key.includes(`${start}-`) || key.includes(`-${end}`)))
    let volunteersForSlotNames = []

    // If the slot is assigned to a competition, show the volunteers assigned to that competition
    if (comp1Keys.length > 0) {
      volunteersForSlotNames = optimizedSchedule[comp1Keys[0]]
    } else if (comp2Keys.length > 0) {
      volunteersForSlotNames = optimizedSchedule[comp2Keys[0]]
    } else {
      volunteersForSlotNames = timeSlotVolunteersMap[slot] || []
    }

    const volunteersForSlotObjects = allVolunteers.filter(v => volunteersForSlotNames.includes(v.name))
    setSelectedTimeSlot(slot)
    setVolunteersForSelectedSlot(volunteersForSlotObjects)
  }

  return (
    <div className="App">
      <h1>Admin Calendar</h1>
      <label className='select-week'>
        Select Week Starting: &nbsp;
        <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)}>
          {mondays.map(monday => (
            <option key={monday} value={monday}>{monday}</option>
          ))}
        </select>
      </label>
      {
        Object.keys(heatMapData).length > 0 && (
          <div className="calendar-container">
            <table className="calendar">
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
                    <th className="header">{formatTime(time)}</th>
                    {daysOfWeek.map(day => (
                      <td
                        key={day}
                        style={{ background: getColorForSlot(`${day} ${formatTime(time)}-${formatTime(time + 0.5)}`) }}
                        onClick={() => handleTimeSlotClick(`${day} ${formatTime(time)}-${formatTime(time + 0.5)}`)}
                      ></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="volunteer-list">
              <h4>{selectedTimeSlot ? `${selectedTimeSlot}` : 'All Volunteers'}</h4>
              <ul>
                {selectedTimeSlot 
                  ? volunteersForSelectedSlot.map(volunteer => <li key={volunteer.uid}>{volunteer.name}{volunteer.canDrive ? '*' : ''}</li>)
                  : allVolunteers.map(volunteer => <li key={volunteer.uid}>{volunteer.name}{volunteer.canDrive ? '*' : ''}</li>)}
              </ul>
            </div>
          </div>
        )
      }
      <button onClick={handleOptimizeClick}>Optimize Schedule</button>
      <div className="w-100 text-center mt-2">
        <Button variant="link" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </div>
  )
}

export default AdminCalendar
