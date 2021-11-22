import React from 'react';
import {
	Router, Switch, Route, NavLink
} from 'react-router-dom';
import Dashboard from './Dashboard';
import NotFound from './NotFound';
import PublicRoute from '../utils/PublicRoute'
import Application from "./Application";
import PrivateRoute from '../utils/PrivateRoute'
import ApplicationForm from './ApplicationForm';
import { getToken } from '../utils/Common';
import my_application from '../fonts/my_application.png'
import application_form from '../fonts/application_form.png'
import take_application_in_work from '../fonts/take_application_in_work.png'
import hiking_dashboard from '../fonts/hiking_dashboard.png'


export default class Home extends React.Component {

	render() {
		return (
			<div className="Home" style={{ height: "100%" }}>
				<div style={{ display: "flex", minHeight: "100%", height: "fit-content" }}>
					<div className="header-home">
						<NavLink exact activeClassName="active" to="/home/dashboard">
							<div className="cell">
								<img src={hiking_dashboard} className="img-home-navbar" style={{ display: "block", marginLeft: "auto", marginRight: "auto", height: 100, width: 100 }} />
								<span style={{ display: "block", color: "white" }}>Табло походов</span>
							</div>
						</NavLink>
						{getToken() && <NavLink exact activeClassName="active" to="/home/tablo">
							<div className="cell">
								<img src={my_application} className="img-home-navbar" style={{ display: "block", marginLeft: "auto", marginRight: "auto", height: 100, width: 100 }} />
								<span style={{ display: "block", color: "white" }}>Мои заявки</span>
							</div>
						</NavLink>}
						<NavLink activeClassName="active" to="/home/review">
							<div className="cell">
								<img src={take_application_in_work} className="img-home-navbar" style={{ display: "block", marginLeft: "auto", marginRight: "auto", height: 100, width: 100 }} />
								<span style={{ display: "block", color: "white" }}>Взять заявку на рецензию</span>
							</div>
						</NavLink>
						{getToken() &&
							<NavLink activeClassName="active" to="/home/form">
								<div className="cell">
									<img src={application_form} className="img-home-navbar" style={{ display: "block", marginLeft: "auto", marginRight: "auto", height: 100, width: 100 }} />
									<span style={{ display: "block", color: "white" }}>Форма подачи заявки</span>
								</div>
							</NavLink>}
					</div>
					<div className="content-home" style={{ width: "100%" }}>
						<Switch>
							{/* <PublicRoute path="/home/application" component={EditForm} /> */}
							<PublicRoute path="/home/application" component={Application} />
							<PrivateRoute path="/home/form" component={ApplicationForm} />
							<Route exact path="/home/dashboard" component={() => <Dashboard isMyApps={false} {...this.props} />} />
							<Route exact path="/home/applications" component={() => <Dashboard isMyApps={true} {...this.props} />} />
							<Route path="*" component={NotFound} />
						</Switch>
					</div>
				</div>
			</div>
		);
	}
}
