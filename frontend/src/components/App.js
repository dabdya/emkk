import React from "react";
import { Switch, Route, NavLink, Link, Redirect } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import Registration from "./Registration";
import NotFound from "./NotFound";
import ForgetPass from "./ForgetPassword";
import ResetPassword from "./ResetPassword";
import { getToken, getUser, removeUserSession, getRoles } from "../utils/Common";
import logo from "../images/mainlogo.png";
import axios from "axios";

class App extends React.Component {

	constructor(props) {
		super(props);
		axios.defaults.baseURL = process.env.REACT_APP_URL;
		this.state = { isLogined: false };
		this.onLogout = this.onLogout.bind(this);
		this.onChangeLogin = this.onChangeLogin.bind(this);
		this.roles = {}
	}

	componentDidMount() {
		if (getToken()) {
			try {
				this.roles = getRoles(getToken());
				this.setState({ isLogined: true });
			} catch (e) {
				this.onLogout();
			}
		} else {
			this.setState({ isLogined: false });
		}
	}

	onLogout() {
		removeUserSession();
		this.roles = {};
		this.setState({ isLogined: false });
	}

	onChangeLogin(value, roles) {
		this.roles = roles;
		this.setState({ isLogined: value });
	}


	render() {
		return (
			<div className="App">
				<div>
					<div className="header" style={{ width: "100%", boxShadow: "2px 2px 2px grey" }}>
						<div style={{ marginLeft: 15 }}>
							<a href="/home/dashboard">
								<img width="62px" height="62px" src={logo} alt="logo" />
							</a>
						</div>
						<div style={{ marginTop: "15px", marginLeft: "15px", marginBottom: "15px", fontSize: "35px" }} className="emkk justify-start">ЭМКК</div>
						{!this.state.isLogined &&
							<>
								<NavLink className="link" activeClassName="active" to="/login">Логин</NavLink>
								<NavLink className="link" activeClassName="active" to="/signup">Регистрация</NavLink>
							</>}
						{this.state.isLogined &&
							<>
								{this.roles.secretary && <a className="link" activeClassName="active" href={process.env.REACT_APP_ADMIN_URL}>Админка</a>}
								<Link className="link" style={{ padding: "0 35px" }} to="/home/account">{getUser()}</Link>
								<Link className="link" style={{ padding: "0 35px" }} onClick={this.onLogout} to="/home/dashboard" >Выйти</Link>
							</>}

					</div>
					<div className="content">
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
export default App