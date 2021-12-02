import React from 'react';
import { BrowserRouter, Switch, Route, NavLink, Link,Redirect } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import Home from './Home';
import Registration from "./Registration";
import ApplicationForm from './ApplicationForm';
import NotFound from './NotFound';
import ForgetPass from './ForgetPassword';
import PublicRoute from '../utils/PublicRoute';
import { getEmkk, getToken, getUser, removeUserSession, setUserSession } from '../utils/Common';


export default class App extends React.Component {

	constructor(props) {
		super(props)

		this.state = { token: null, isLogined: true };
		this.onLogout = this.onLogout.bind(this);
	}

	async componentDidMount() {
		this.setState({ token: getToken() })
		if (!this.state.token) {
			return;
		}
		let config = {
			headers: {
				Authorization: 'Token ' + this.state.token
			}
		};
		await axios.get(`${process.env.REACT_APP_URL}/auth/user`, config).then(response => {
			setUserSession(response.data.user.access_token, response.data.user.refresh_token, response.data.user.username);
			this.setState({ isLogined: true });
		}).catch(error => {
			console.error(error);
			removeUserSession();
		});
	}

	onLogout() {
		removeUserSession();
		window.location.href = '/';
	}

	render() {
		return (
			<div className="App">
				<BrowserRouter basename="/">
					<div style={{ height: "100%" }}>
						<div className="header" style={{ boxShadow: "2px 2px 2px grey" }}>
							<div style={{ marginTop: "15px", marginLeft: "15px", marginBottom: "15px", fontSize: "35px" }} className="emkk justify-start">ЕМКК</div>
							{!getEmkk() &&
								<>
									<NavLink className="link" activeClassName="active" to="/login">Логин</NavLink>
									<NavLink className="link" activeClassName="active" to="/signup">Регистрация</NavLink>
								</>}
							{getEmkk() &&
								<>
									<div>{getUser()} </div>
									<Link className="link" style={{ padding: "0 35px" }} onClick={this.onLogout} to="/home/dashboard" >Выйти</Link>
								</>}

						</div>
						<div className="content" style={{ height: "80%" }}>
							<Switch>
								<Route exact path="/" render={() => (
									<Redirect to="/home/dashboard" />
								)} />
								<Route exact path="/home/*" render={(props) => <Home isLogined={this.state.isLogined} {...props} />} />
								<PublicRoute path="/reset-password" component={ForgetPass} />
								<Route path="/login" component={Login} />
								<Route path="/signup" component={Registration} />
								<PublicRoute path="/form" component={ApplicationForm} />
								<Route path="*" component={NotFound} />
							</Switch>
						</div>
					</div>
				</BrowserRouter>
			</div>
		);

	}
}
