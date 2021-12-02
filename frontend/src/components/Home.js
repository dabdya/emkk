import React from 'react';
import { Switch, Route, NavLink } from 'react-router-dom';
import Dashboard from './Dashboard';
import NotFound from './NotFound';
import Application from "./Application";
import ApplicationForm from './ApplicationForm';
import { getEmkk, getReviewer } from '../utils/Common';
import my_application from '../images/my_application.png'
import application_form from '../images/application_form.png'
import take_application_in_work from '../images/take_application_in_work.png'
import hiking_dashboard from '../images/hiking_dashboard.png'


export default class Home extends React.Component {

	render() {
		return (
			<div className="Home" style={{ height: "100%" }}>
				<div style={{ display: "flex", minHeight: "100%", height: "fit-content" }}>
					<div className="header-home" style={{ boxShadow: "2px 2px 2px grey" }}>
						<NavLink exact activeClassName="active" to="/home/dashboard">
							<div className="cell">
								<img alt="" src={hiking_dashboard} className="img-home-navbar" style={{ display: "block", marginLeft: "auto", marginRight: "auto", height: 100, width: 100 }} />
								<span style={{ display: "block", color: "white" }}>Табло походов</span>
							</div>
						</NavLink>
						{getEmkk() &&
							<>
								<NavLink exact activeClassName="active" to="/home/applications">
									<div className="cell">
										<img alt="" src={my_application} className="img-home-navbar" style={{ display: "block", marginLeft: "auto", marginRight: "auto", height: 100, width: 100 }} />
										<span style={{ display: "block", color: "white" }}>Мои заявки</span>
									</div>
								</NavLink>
								<NavLink activeClassName="active" to="/home/form">
									<div className="cell">
										<img alt="" src={application_form} className="img-home-navbar" style={{ display: "block", marginLeft: "auto", marginRight: "auto", height: 100, width: 100 }} />
										<span style={{ display: "block", color: "white" }}>Подать заявку</span>
									</div>
								</NavLink>
							</>}
						{getReviewer() &&
							<>
								<NavLink activeClassName="active" to="/home/my_reviews">
									<div className="cell">
										<img alt="" src={take_application_in_work} className="img-home-navbar" style={{ display: "block", marginLeft: "auto", marginRight: "auto", height: 100, width: 100 }} />
										<span style={{ display: "block", color: "white" }}>Заявки</span>
									</div>
								</NavLink>
							</>}
					</div>
					<div className="content-home" style={{ paddingLeft: "3px", width: "100%" }}>
						<Switch>
							<Route path="/home/application" component={Application} />
							<Route path="/home/form" component={ApplicationForm} />
							<Route exact path="/home/dashboard" component={() => <Dashboard isMyApps={false} {...this.props} />} />
							<Route exact path="/home/applications" component={() => <Dashboard isMyApps={true} {...this.props} />} />
							<Route exact path="/home/my_reviews" component={() => getReviewer() ? <Dashboard isMyReview={true} {...this.props} /> : <NotFound {...this.props} />} />
							<Route path="*" component={NotFound} />
						</Switch>
					</div>
				</div>
			</div>
		);
	}
}
