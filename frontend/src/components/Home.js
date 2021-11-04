import React from 'react';
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
				<BrowserRouter>
					<div>
						<div className="header">
							<NavLink exact activeClassName="active" to="/home/poxod">Табло походов</NavLink>
							<NavLink activeClassName="active" to="/review">Мои заявки</NavLink>
						</div>
						<div className="content">
							<Switch>
								<Route  path="/home/poxod">
									<Dashboard />
									</Route>
								<Route path="*" component={NotFound} />
							</Switch>
						</div>
					</div>
				</BrowserRouter>
			</div>
		);
	}


}
