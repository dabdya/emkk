import React from 'react';
import { BrowserRouter, Switch, Route, NavLink } from 'react-router-dom';
import axios from 'axios';

import Login from './Login';
import Dashboard from './Dashboard';
import Home from './Home';
import Registration from "./Registration";

import PrivateRoute from '../utils/PrivateRoute';
import PublicRoute from '../utils/PublicRoute';
import { getToken, removeUserSession, setUserSession } from '../utils/Common';
import ApplicationForm from './ApplicationForm';

export default class App extends React.Component {

	constructor(props){
		super(props)

		this.state = {token: null};
	}
	authLoading = null;

	componentDidMount(){
		this.setState({token: getToken()})
		//const token = getToken();
		if (!this.state.token) {
	  		return;
		}
		let config = {
			headers: {
			  Authorization: 'Token ' + this.state.token //the token is a variable which holds the token
			  }
		  };

		axios.get(`http://localhost:8000/auth/user`, config).then(response => {
			setUserSession(response.data.user.token, response.data.user.username);
			this.setState({authLoading:true});
			}).catch(error => {
			removeUserSession();
			this.setState({authLoading:false});
		});
	}

	render(){
		if (this.authLoading && getToken()) {
			return <div className="content">Checking Authentication...</div>
		} else {
			return (
				<div className="App">
				  <BrowserRouter>
					<div>
					  <div className="header">
						<NavLink exact activeClassName="active" to="/">Home</NavLink>
						{!this.state.token && <>
							<NavLink activeClassName="active" to="/login">Login</NavLink><small>(Access without token)</small>
							<NavLink activeClassName="active" to="/signup">Registration</NavLink><small>(Access without token)</small>
						</>
						}
						<NavLink activeClassName="active" to="/dashboard">Dashboard</NavLink><small>(Access with token only)</small>
					  </div>
					  <div className="content">
						<Switch>
						  <Route exact path="/" component={Home} />
						  <Route exact path="/app" component={ApplicationForm} />
						  <PublicRoute path="/login" component={Login} />
						  <PublicRoute path="/signup" component={Registration} />
						  <PrivateRoute path="/dashboard" component={Dashboard} />
						</Switch>
					  </div>
					</div>
				  </BrowserRouter>
				</div>
			  );
		}
	}
}
