/**
 * Component for creating private routes that are accessible only by authenticated users
 */

import React from "react"
import { Route, Redirect } from "react-router-dom"
import { useAuth } from "./AuthContext"

export default function PrivateRoute({ component: Component, ...rest }) {
  const { currentUser } = useAuth()  // Fetch the current authenticated user

  // Render the route: if a user is authenticated, show the component, otherwise redirect to login
  return (
    <Route
      {...rest}
      render={props => {
        return currentUser ? <Component {...props} /> : <Redirect to="/login" />
      }}
    ></Route>
  )
}
