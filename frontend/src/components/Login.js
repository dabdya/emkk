import React from "react";
import axios from "axios";
import { getToken, setUserSession, getRoles } from "../utils/Common";
import { TextField, Button } from "@mui/material"
import { withRouter } from "react-router-dom";

class Login extends React.Component {

	constructor(props) {
		super(props);

		this.state = { login: "", password: "", error: "" };
		this.onSubmit = this.onSubmit.bind(this);
		this.changeInputRegister = this.changeInputRegister.bind(this);
	}


	onSubmit(e) {
		e.preventDefault();
		axios.post(`${process.env.REACT_APP_URL}/auth/users/login`, { user: { username: this.state.login, password: this.state.password } })
			.then(response => {
				setUserSession(response.data.user.access_token, response.data.user.refresh_token, response.data.user.username);
				this.props.onChangeLogin(true, getRoles(getToken()));
				this.props.history.push("/home/dashboard");
			}).catch(err => {
				if (err.response?.data?.user) this.setState({ error: "Неправильный логин или пароль" });
				else this.setState({ error: "Ошибка. Попробуйте позже" });
			});
	}

	changeInputRegister(event) {
		event.persist();
		this.setState(prev => {
			return {
				...prev,
				[event.target.name]: event.target.value
			}

		})
	};

	render() {
		return (
			<div className="box" style={{
				padding: "3rem 1rem",
				display: "flex",
				width: "35%",
				border: "0.5px solid gray",
				borderRadius: 15,
				position: "fixed",
				top: "50%",
				left: "50%", transform: "translate(-50%, -50%)",
				justifyContent: "center"
			}}>
				<form style={{ width: "80%", display: "flex", flexFlow: "column wrap", height: "fit-content" }} onSubmit={this.onSubmit}>
					<TextField fullWidth error={this.state.error.length > 0} id="outlined-required" name="login"
						required margin="normal" label="Логин или Email" helperText={this.state.error} variant="outlined" onChange={this.changeInputRegister} />
					<TextField fullWidth error={this.state.error.length > 0} id="outlined-password-input" name="password"
						required margin="normal" label="Пароль" type="password" helperText={this.state.error} variant="outlined" onChange={this.changeInputRegister} />
					<div>
						<Button variant="outlined" size="small" href="/forget-password">
							Забыли пароль?
						</Button>
					</div>
					<Button size="large" variant="contained"
						type="submit"
						style={{
							marginTop: 20
						}}>
						Войти
					</Button>
				</form>
			</div>
		);
	}
}

export default withRouter(Login);