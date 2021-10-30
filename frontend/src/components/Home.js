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
				<BrowserRouter>
					<div>
						<div className="header">
							<NavLink exact activeClassName="active" to="/">Табло походов</NavLink>
							<NavLink activeClassName="active" to="/review">Мои заявки</NavLink>
						</div>
						<div className="content">
							<Switch>
								<Route exact path="/">
									<Dashboard isLogin={this.props.isLogin} />
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
