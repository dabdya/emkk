import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { getToken } from './Common';

function PublicRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>  <Component {...props} />}
    />
  )
}

export default PublicRoute;