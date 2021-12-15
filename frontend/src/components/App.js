import React from "react";
import { Switch, Route, NavLink, Link, Redirect, withRouter } from "react-router-dom";
import axios from "axios";
import Login from "./Login";
import Home from "./Home";
import Registration from "./Registration";
import NotFound from "./NotFound";
import ForgetPass from "./ForgetPassword";
import ResetPassword from "./ResetPassword";
import { getToken, getUser, removeUserSession, setUserSession, getRoles } from "../utils/Common";
import logo from "../images/mainlogo.png";


class App extends React.Component {

	constructor(props) {
		super(props)
		this.state = { isLogined: false };
		this.onLogout = this.onLogout.bind(this);
		this.onChangeLogin = this.onChangeLogin.bind(this);
		this.roles = {}
	}

	componentDidMount() {
		if (getToken()) {
			// const config = {
			// 	headers: {
			// 		Authorization: "Token " + getToken()
			// 	}
			// };

			// axios.get(`${process.env.REACT_APP_URL}/auth/user`, config).then(response => {
			// 	setUserSession(response.data.user.access_token, response.data.user.refresh_token, response.data.user.username);
			// 	this.setState({ isLogined: true });
			// }).catch(error => {
			// 	console.error(error);
			// 	removeUserSession();
			// });

			this.roles = getRoles(getToken());
			this.setState({ isLogined: true });
		} else {
			this.setState({ isLogined: false });
		}
	}

	onLogout() {
		removeUserSession();
		this.setState({ isLogined: false });
		this.roles = {};
	}

	onChangeLogin(value, roles) {
		this.setState({ isLogined: value });
		this.roles = roles;
	}


	render() {
		return (
			<div className="App">
				<div style={{ height: "100%" }}>
					<div className="header" style={{ width: "100%", boxShadow: "2px 2px 2px grey" }}>
						<div style={{ marginLeft: 15 }}>
							<a href="/home/dashboard">
								<img width="62px" height="62px" src={logo} alt="logo" />
							</a>
						</div>
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
							<Route path="/reset-password/:token" component={ResetPassword} />
							<Route exact path="/home/*" render={(props) => <Home roles={this.roles} {...props} />} />
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