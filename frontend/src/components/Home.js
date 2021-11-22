import React from 'react';
import { BrowserRouter, Switch, Route, NavLink } from 'react-router-dom';
import Dashboard from './Dashboard';
import NotFound from './NotFound';
import PublicRoute from '../utils/PublicRoute'
import Application from "./Application";
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
				<BrowserRouter basename="/home">
					<div style={{ display: "flex", minHeight: "100%", height: "fit-content" }}>
						<div className="header-home">
							<NavLink exact activeClassName="active" to="/dashboard"><div className="cell">Мои заявки</div></NavLink>
							<NavLink exact activeClassName="active" to="/tablo"><div className="cell">Табло походов</div></NavLink>
							<NavLink activeClassName="active" to="/review"><div className="cell">Ревью</div></NavLink>
							{getToken() && <NavLink activeClassName="active" to="/form"> <div className="cell">Форма </div></NavLink>}
						</div>
						<div className="content-home" style={{ width: "100%" }}>
							<Switch>
								{/* <PublicRoute path="/home/application" component={EditForm} /> */}
								<Route path="/application" component={Application} />
								<PrivateRoute path="/form" component={ApplicationForm} />
								<PublicRoute path="/dashboard" component={Dashboard} />
								<Route exact path="/tablo" render={(props) => <Dashboard isMyApps={true} {...props} />} />
								{/* <Route path="*" component={NotFound} /> */}
							</Switch>
						</div>
					</div>
				</BrowserRouter>
			</div>
		);
	}


}
