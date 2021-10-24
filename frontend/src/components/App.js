import React from 'react';
import { BrowserRouter, Switch, Route, NavLink } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import Dashboard from './Dashboard';
import Home from './Home';
import Registration from "./Registration";
import { Router } from 'react-router-dom';
import ApplicationForm from './ApplicationForm';
import Requests from '../utils/requests';
import NotFound from './NotFound';
import PrivateRoute from '../utils/PrivateRoute';
import PublicRoute from '../utils/PublicRoute';
import { getToken, removeUserSession, setUserSession } from '../utils/Common';

export default class App extends React.Component {

	constructor(props) {
		super(props)

		this.state = { token: null };
	}
	authLoading = null;

	async componentDidMount() {
		this.setState({ token: getToken() })
		//const token = getToken();
		if (!this.state.token) {
			return;
		}
		let config = {
			headers: {
				Authorization: 'Token ' + this.state.token //the token is a variable which holds the token
			}
		};
		await axios.get(`http://localhost:8000/auth/user`, config).then(response => {
			setUserSession(response.data.user.access_token, response.data.user.refresh_token, response.data.user.username);
			this.setState({ authLoading: true });
		}).catch(error => {
			removeUserSession();
			this.setState({ authLoading: false });
		});
	}

	render() {
		if (this.authLoading && getToken()) {
			return <div className="content">Checking Authentication...</div>
		} else {
			return (
				<div className="App">
					<BrowserRouter>
						<div>
							<div className="header">
								<NavLink exact activeClassName="active" to="/">Home</NavLink>
								{!this.state.token &&
									<>
										<NavLink activeClassName="active" to="/login">Login</NavLink>
										<NavLink activeClassName="active" to="/signup">Registration</NavLink>
									</>}
								<NavLink activeClassName="active" to="/form">Form</NavLink>
								{this.state.token && <button onClick={() => { removeUserSession(); }} value="Logout">Выйти</button>}

							</div>
							<div className="content">
								<Switch>
									<Route exact path="/">
										<Home isLogin={this.state.token} />
									</Route>
									<Route path="/login" component={Login} />
									<Route path="/signup" component={Registration} />
									<PrivateRoute path="/form" component={ApplicationForm} />
									<Route path="*" component={NotFound} />
								</Switch>
							</div>
						</div>
					</BrowserRouter>
				</div>
			);
		}
	}
}
