import React from 'react';
import { BrowserRouter, Switch, Route, NavLink } from 'react-router-dom';
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
							<NavLink exact activeClassName="active" to="/home/dashboard">
								<div className="cell">
									<img src={my_application} className="img-home-navbar" style={{display:"block", marginLeft: "auto", marginRight:"auto", height: 100, width: 100}}/>
									<span style={{display:"block", color:"white"}}>Мои заявки</span>
								</div>
							</NavLink>
							<NavLink activeClassName="active" to="/home/review">
								<div className="cell">
									<img src={take_application_in_work} className="img-home-navbar" style={{display:"block", marginLeft: "auto", marginRight:"auto", height: 100, width: 100}}/>
									<span style={{display:"block", color:"white"}}>Взять заявку на рецензию</span>
								</div>
							</NavLink>
							{getToken() &&
							<NavLink activeClassName="active" to="/home/form">
								<div className="cell">
									<img src={application_form} className="img-home-navbar" style={{display:"block", marginLeft: "auto", marginRight:"auto", height: 100, width: 100}}/>
									<span style={{display:"block", color:"white"}}>Форма подачи заявки</span>
								</div>
							</NavLink>}
						</div>
						<div className="content-home" style={{ width: "100%" }}>
							<Switch>
								{/* <PublicRoute path="/home/application" component={EditForm} /> */}
								<PublicRoute path="/home/application" component={Application} />
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
