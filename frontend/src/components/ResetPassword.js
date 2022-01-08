import React from "react";
import axios from "axios";
import { TextField, Button } from "@mui/material"
import { withRouter } from "react-router-dom";
import jwt_decode from "jwt-decode";
import validator from "validator";

class ResetPassword extends React.Component {

	constructor(props) {
		super(props);
		this.resetToken = this.props.match.params.token;
		try {
			const decodedToken = jwt_decode(this.resetToken);
			if (decodedToken.exp * 1000 < new Date().getTime()) {
				throw new Error("Invalid token or expired token");
			}
		} catch (e) {
			this.props.history.push("/");
		}
		this.state = { password: "", secondPassword: "", message: "" };
		this.onSubmit = this.onSubmit.bind(this);

	}

	onSubmit(e) {
		e.preventDefault();
		if (this.state.password !== this.state.secondPassword) {
			this.setState({ message: "Пароли не совпадают" });
		} else if (!validator.isStrongPassword(this.state.password, { minLength: 6, minSymbols: 0, minNumbers: 0, minUppercase: 0 })) {
			this.setState({ message: "Пароль должен состоять из шести маленьких латинских букв" });
		} else {
			axios.patch("/auth/user",
				{
					user: {
						password: this.state.password
					},
					reset_token: "Token " + this.resetToken
				}
			).then(() => {
				this.setState({ message: "Вы успешно сменили пароль" });
			})
		}
	}

	render() {
		return (
			<div className="center">
				<form
					className="reset-password"
					onSubmit={this.onSubmit}>
					<TextField
						name="password" type="password"
						required label="Новый пароль" variant="outlined"
						onChange={(e) => { this.setState({ password: e.target.value }); }} />
					<TextField
						name="secondPassword" type="password"
						required label="Новый пароль" variant="outlined"
						onChange={(e) => { this.setState({ secondPassword: e.target.value }); }} />
					<Button type="submit" variant="contained">
						Сменить пароль
					</Button>
					{this.state.message}
				</form>
			</div>
		);
	}
}

export default withRouter(ResetPassword);