import React from 'react';
import { BrowserRouter, Switch, Route, NavLink } from 'react-router-dom';
import Dashboard from './Dashboard';
import NotFound from './NotFound';
import PublicRoute from '../utils/PublicRoute'
import PrivateRoute from '../utils/PrivateRoute'
import ApplicationForm from './ApplicationForm';
import { getToken } from '../utils/Common';

export default class Home extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div className="Home" style={{ height: "100%" }}>
				<BrowserRouter>
					<div style={{ display: "flex", minHeight: "100%", height: "fit-content" }}>
						<div className="header-home">
							<NavLink exact activeClassName="active" to="/home/dashboard"><div className="cell">Мои заявки</div></NavLink>
							<NavLink activeClassName="active" to="/home/review"><div className="cell">Ревью</div></NavLink>
							{getToken() && <NavLink activeClassName="active" to="/home/form"> <div className="cell">Форма </div></NavLink>}
						</div>
						<div className="content-home" style={{ width: "100%" }}>
							<Switch>

								<PrivateRoute path="/home/form" component={ApplicationForm} />
								<PublicRoute path="/home/dashboard" component={Dashboard} />
								<Route path="*" component={NotFound} />
							</Switch>
						</div>
					</div>
				</BrowserRouter>
			</div>
		);
	}


}
