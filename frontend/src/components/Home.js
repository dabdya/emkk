import React from 'react';
import { removeUserSession } from '../utils/Common';
import { BrowserRouter, Switch, Route, NavLink } from 'react-router-dom';
import Dashboard from './Dashboard';
import NotFound from './NotFound';

export default class Home extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="Home">
				<button onClick={() => { removeUserSession(); }} value="Logout" />
				<BrowserRouter>
					<div>
						<div className="header">
							<NavLink exact activeClassName="active" to="/home/dashboard">Табло походов</NavLink>
							<NavLink activeClassName="active" to="/home/review">Мои заявки</NavLink>
						</div>
						<div className="content">
							<Switch>
								<Route exact path="/home/dashboard" component={Dashboard} />
								<Route path="*" component={NotFound} />
							</Switch>
						</div>
					</div>
				</BrowserRouter>
			</div>
		);
	}


}
