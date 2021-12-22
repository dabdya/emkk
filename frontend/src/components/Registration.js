import React from "react"
import axios from "axios";
import validator from "validator";
import { TextField, Button } from "@mui/material"
import { withRouter } from "react-router-dom";

class Registration extends React.Component {

	constructor(props) {
		super(props);

		this.state =
		{
			username: "",
			email: "",
			password: "",
			password2: "",
			firstName: "",
			secondName: "",
			patronymic: "",

			emailError: "",
			loginError: "",
			passwordValidityError: "",
			serverIssueError: "",
			successfullRegistration: "",
			pendingServerResponse: "",
		};
		this.onSubmit = this.onSubmit.bind(this);
		this.changeInputRegister = this.changeInputRegister.bind(this);
		this.changeEmail = this.changeEmail.bind(this);
		this.close = this.close.bind(this);
	}
	changeEmail(event) {
		event.persist();
		if (validator.isEmail(event.target.value)) {
			this.setState({ [event.target.name]: event.target.value });
			this.setState({ emailError: "" });
		} else {
			this.setState({ emailError: "Введите валидный Email" });
		}
	}

	changeInputRegister(event) {
		event.persist();
		this.setState({ [event.target.name]: event.target.value });
	};

	close() {
		this.setState(() => ({ buttonIsPressed: false }))
		this.props.history.push("/")
	}

	async onSubmit(event) {
		event.preventDefault();
		if (this.state.password !== this.state.password2) {
			this.setState({ passwordValidityError: "Пароли не совпадают" })
		} else if (!validator.isStrongPassword(this.state.password, { minLength: 6, minSymbols: 0, minNumbers: 0, minUppercase: 0 })) {
			this.setState({ passwordValidityError: "Пароль должен состоять из шести маленьких латинских букв" });
		} else if (/@/.test(this.state.username)) {
			this.setState({ loginError: "Логин не может содержать @" });
		}
		else {
			this.setState({
				serverIssueError: "",
				pendingServerResponse: "Подождите..."
			})
			const data = {
				username: this.state.username,
				email: this.state.email,
				password: this.state.password,
				first_name: this.state.firstName,
				last_name: this.state.secondName
			}
			if (this.state.patronymic) {
				Object.assign(data, { patronymic: this.state.patronymic });
			}
			axios.post(`${process.env.REACT_APP_URL}/auth/users`, {
				user: data
			}).then(res => {
				this.setState({
					pendingServerResponse: "",
					serverIssueError: "",
					loginError: "",
					successfullRegistration: "Регистрация прошла успешно. Сейчас вы будете перенаправлены на страницу логина"
				});
				window.setTimeout(() => this.props.history.push("/login"), 2500);

			}).catch(err => {
				this.setState({
					pendingServerResponse: "",
					serverIssueError: err.response.data.user.username || err.response.data.user.email
				});
			})
		}
	};

	render() {
		return (
			<div className="box" style={{
				padding: "3rem 2rem 1rem 2rem",
				display: "flex",
				width: "35%",
				border: "0.1rem outset gray",
				borderRadius: 15,
				position: "fixed",
				top: "55%",
				left: "50%", transform: "translate(-50%, -50%)",
				justifyContent: "center",
				maxHeight: "75%",
			}}>
				<form style={{
					width: "80%",
					display: "inline-block"
				}} onSubmit={this.onSubmit}>
					<TextField fullWidth id="outlined-required" size="small" name="username" required
						error={this.state.loginError.length > 0} helperText={this.state.loginError}
						margin="normal" label="Логин"
						variant="outlined" onChange={this.changeInputRegister} />
					<TextField error={this.state.emailError.length > 0} helperText={this.state.emailError} fullWidth id="outlined-required" size="small" name="email" required
						margin="normal" label="Email"
						variant="outlined" onChange={this.changeEmail} />
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<TextField id="outlined-required" size="small" name="firstName" required
							margin="normal" label="Имя"
							variant="outlined" onChange={this.changeInputRegister} />
						<TextField id="outlined-required" size="small" name="secondName" required
							margin="normal" label="Фамилия"
							variant="outlined" onChange={this.changeInputRegister} />
					</div>
					<TextField fullWidth id="outlined" size="small" name="patronymic"
						margin="normal" label="Отчество"
						variant="outlined" onChange={this.changeInputRegister} />
					<TextField error={this.state.passwordValidityError.length > 0}
						fullWidth id="outlined-required" size="small" type="password" name="password" required
						margin="normal" label="Пароль"
						variant="outlined" onChange={this.changeInputRegister} />
					<TextField error={this.state.passwordValidityError.length > 0} fullWidth id="outlined-required" size="small"
						helperText={this.state.passwordValidityError}
						type="password" name="password2" required
						margin="normal" label="Повторите пароль"
						variant="outlined" onChange={this.changeInputRegister} />
					<Button fullWidth size="medium" variant="contained"
						type="submit"
						disabled={this.state.pendingServerResponse.length > 0 ||
							this.state.successfullRegistration.length > 0}
						style={{
							marginTop: 20
						}}>
						Зарегистрироваться
					</Button>
					<div style={{ display: "flex", justifyContent: "center" }}>
						<span style={{ marginTop: 5, color: "gray" }}>ЭМКК</span>
					</div>
					{this.state.serverIssueError &&
						<div style={{ display: "flex", justifyContent: "center" }}>
							<span style={{ color: "darkred" }}>
								{this.state.serverIssueError}
							</span>
						</div>
					}
					{this.state.successfullRegistration &&
						<div style={{ display: "flex", justifyContent: "center" }}>
							<span style={{ color: "green" }}>
								{this.state.successfullRegistration}
							</span>
						</div>
					}
					{this.state.pendingServerResponse &&
						<div style={{ display: "flex", justifyContent: "center" }}>
							<span>
								{this.state.pendingServerResponse}
							</span>
						</div>
					}
				</form>
			</div>
		)
	}
}

export default withRouter(Registration);