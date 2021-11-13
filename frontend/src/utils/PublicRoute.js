import React from 'react';
import { Route } from 'react-router-dom';


export default function PublicRoute({ component: Component, ...props }) {
	return (
		<Route
			{...props}
			render={(props) => <Component {...props} />}
		/>
	)
}