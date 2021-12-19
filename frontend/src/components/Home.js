import React from "react";
import { Switch, Route, NavLink, withRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import NotFound from "./NotFound";
import Application from "./Application";
import ApplicationForm from "./ApplicationForm";
import my_application from "../images/my_application.png"
import application_form from "../images/application_form.png"
import take_application_in_work from "../images/take_application_in_work.png"
import hiking_dashboard from "../images/hiking_dashboard.png"
import Account from "./Account";


class Home extends React.Component {

	render() {
		return (
			<div className="Home">
				<div className="header-home">
					<NavLink exact activeClassName="active" to="/home/dashboard">
						<div className="cell">
							<img alt="" src={hiking_dashboard} className="img-home-navbar" />
							<span style={{ display: "block", color: "white" }}>Табло походов</span>
						</div>
					</NavLink>
					{(this.props.roles.reviewer || this.props.roles.issuer) &&
						<>
							<NavLink activeClassName="active" to="/home/my_reviews">
								<div className="cell">
									<img alt="" src={take_application_in_work} className="img-home-navbar" />
									<span style={{ display: "block", color: "white" }}>Мои рецензии</span>
								</div>
							</NavLink>
						</>}
					{this.props.roles.emkkMember &&
						<>
							<NavLink exact activeClassName="active" to="/home/applications" >
								<div className="cell">
									<img alt="" src={my_application} className="img-home-navbar" />
									<span style={{ display: "block", color: "white" }}>Мои заявки</span>
								</div>
							</NavLink>
							<NavLink activeClassName="active" to="/home/form">
								<div className="cell">
									<img alt="" src={application_form} className="img-home-navbar" />
									<span style={{ display: "block", color: "white" }}>Подать заявку</span>
								</div>
							</NavLink>
						</>}
				</div>
				<div className="content-home" style={{ paddingLeft: "3px", width: "100%" }}>
					<Switch>
						<Route path="/home/account" component={Account}/>
						<Route path="/home/application/:id" component={() => this.props.roles.emkkMember ? <Application {...this.props} /> : <NotFound {...this.props} />} />
						<Route path="/home/form" component={() => this.props.roles.emkkMember ? <ApplicationForm /> : <NotFound {...this.props} />} />
						<Route exact path="/home/dashboard" component={() => <Dashboard isMyApps={false} {...this.props} />} />
						<Route exact path="/home/applications" component={() => this.props.roles.emkkMember ? <Dashboard isMyApps={true} {...this.props} /> : <NotFound {...this.props} />} />
						<Route exact path="/home/my_reviews" component={() => (this.props.roles.reviewer || this.props.roles.issuer) ? <Dashboard isMyReview={true} {...this.props} /> : <NotFound {...this.props} />} />
						<Route path="*" component={NotFound} />
					</Switch>
				</div>
			</div>
		);
	}
}

export default withRouter(Home);