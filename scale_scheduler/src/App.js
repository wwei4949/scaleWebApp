import React from "react"
import Signup from "./components/signup/Signup"
import { Container } from "react-bootstrap"
import { AuthProvider } from "./backend/auth/AuthContext"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import Login from "./components/login/Login"
import PrivateRoute from "./backend/auth/PrivateRoute"
import ForgotPassword from "./components/login/ForgotPassword"
import VolunteerCalendar from "./components/calendars/VolunteerCalendar"
import AdminCalendar from "./components/calendars/AdminCalendar"

function App() {
  return (
    <div className="appContainer" style={{minHeight: "100vh", minWidth:"100vw", backgroundColor: "#181818"}}>
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh"}}
    >
        <Router>
          <AuthProvider>
            <Switch>
              <PrivateRoute exact path="/" component={VolunteerCalendar} />
              <PrivateRoute exact path="/admin" component={AdminCalendar} />
              <Route path="/signup" component={Signup} />
              <Route path="/login" component={Login} />
              <Route path="/forgot-password" component={ForgotPassword} />
            </Switch>
          </AuthProvider>
        </Router>
    </Container>
    </div>
  )
}

export default App
