import React from "react";
import { Route } from "react-router-dom";
import Login from "../components/Login";
import { getToken } from "./Common";

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={(rest) => getToken() ? <Component {...rest} /> : <Login {...rest} /> }
    />
  )
}

export default PrivateRoute;