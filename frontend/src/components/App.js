import React from 'react';
import { BrowserRouter, Switch, Route, NavLink, Link, Redirect } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import Home from './Home';
import Registration from "./Registration";
import ApplicationForm from './ApplicationForm';
import NotFound from './NotFound';
import ForgetPass from './ForgetPassword';
import ResetPassword from './ResetPassword';
import { getEmkk, getToken, getUser, removeUserSession, setUserSession } from '../utils/Common';
import { withRouter } from 'react-router-dom';


class App extends React.Component {

	constructor(props) {
		super(props)
		this.state = { token: null };
		this.onLogout = this.onLogout.bind(this);
		this.onChangeLogin = this.onChangeLogin.bind(this);
	}
	//DEBUG
	async componentDidMount() {
		this.setState({ token: getToken() })
		if (getToken()) {
			this.setState({ isLogined: true });
		} else {
			this.setState({ isLogined: false });
		}
		return;
		let config = {
			headers: {
				Authorization: 'Token ' + this.state.token
			}
		};
		await axios.get(`${process.env.REACT_APP_URL}/auth/user`, config).then(response => {
			setUserSession(response.data.user.access_token, response.data.user.refresh_token, response.data.user.username);
			this.setState({ isLogined: true });
			console.log('im here')
		}).catch(error => {
			console.error(error);
			removeUserSession();
		});
	}

	onLogout() {
		removeUserSession();
		this.setState({ isLogined: false });
	}

	onChangeLogin(value) {
		this.setState({ isLogined: value });
	}


	render() {
		return (
			<div className="App">
				<div style={{ height: "100%" }}>
					<div className="header" style={{ boxShadow: "2px 2px 2px grey" }}>
						<div style={{ marginTop: "15px", marginLeft: "15px", marginBottom: "15px", fontSize: "35px" }} className="emkk justify-start">ЕМКК</div>
						{!this.state.isLogined &&
							<>
								<NavLink className="link" activeClassName="active" to="/login">Логин</NavLink>
								<NavLink className="link" activeClassName="active" to="/signup">Регистрация</NavLink>
							</>}
						{this.state.isLogined &&
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
							<Route path="/signup" component={Registration} />
							<Route path="/form" component={ApplicationForm} />
							<Route path="/reset-password/:token" component={ResetPassword} />
							<Route exact path="/home/*" render={(props) => <Home isLogined={this.state.isLogined} {...props} />} />
							<Route path="/forget-password" component={ForgetPass} />
							<Route path="/login">
								<Login onChangeLogin={this.onChangeLogin} {...this.props} />
							</Route>


							<Route path="*" component={NotFound} />
						</Switch>
					</div>
				</div>
			</div >
		);

	}
}
export default withRouter(App)