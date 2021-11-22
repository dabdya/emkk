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

	render() {
		return (
			<div className="Home" style={{ height: "100%" }}>

				<div style={{ display: "flex", minHeight: "100%", height: "fit-content" }}>
					<div className="header-home">
						<NavLink exact activeClassName="active" to="/home/dashboard"><div className="cell">Табло походов</div></NavLink>
						{getToken() && <NavLink exact activeClassName="active" to="/home/tablo"><div className="cell">Мои заявки</div></NavLink>}
						{getToken() && <NavLink activeClassName="active" to="/home/form"> <div className="cell">Форма</div></NavLink>}
					</div>
					<div className="content-home" style={{ width: "100%" }}>
						<Switch>
							{/* <PublicRoute path="/home/application" component={EditForm} /> */}
							<Route path="/home/application" component={Application} />
							<PrivateRoute path="/home/form" component={ApplicationForm} />
							<Route exact path="/home/dashboard" component={() => <Dashboard isMyApps={false} {...this.props} />} />
							<Route exact path="/home/tablo" component={() => <Dashboard isMyApps={true} {...this.props} />} />
							{/* <Route path="*" component={NotFound} /> */}
						</Switch>
					</div>
				</div>
			</div>
		);
	}


}
