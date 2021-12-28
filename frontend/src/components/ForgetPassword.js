import React from "react";
import axios from "axios";
import { TextField, Button } from "@mui/material"

class ForgetPass extends React.Component {

	constructor(props) {
		super(props);

		this.state = { login: "", error: "", success: "", isPressed: false };
		this.onSubmit = this.onSubmit.bind(this);

	}

	onSubmit(e) {
		e.preventDefault();
		this.setState({ isPressed: true });
		const data = {
			email: this.state.login,
			reset_url: `${process.env.REACT_APP_RESET_URL}/reset-password`
		}
		axios.post("/auth/users/reset-password", data)
			.then(resp => {
				this.setState({ error: "" })
				this.setState({ success: `Письмо успешно отправлено на ${this.state.login}.\nЕсли Письмо не пришло, проверьте папку "Спам".` })
			})
			.catch(err => {
				if (err.response?.status === 422) {
					this.setState({ error: "Пользователь с таким адресом почты не найден." })
				} else {
					this.setState({ error: "Ошибка, попробуйте позже." })
				}
				this.setState({ isPressed: false })
			})
	}

	render() {
		return (
			<div className="center">
				<form onSubmit={this.onSubmit} style={{
					display: "grid",
					border: "0.5px solid gray",
					borderRadius: 15,
					padding: 35,
					gridRowGap: 10,
				}}>
					<TextField
						name="login" type="email"
						required label="Почта" variant="outlined"
						onChange={(e) => { this.setState({ login: e.target.value }); }} />
					<Button type="submit" variant="contained" disabled={this.state.isPressed}>
						Восстановить пароль
					</Button>

					{this.state.success &&
						<>
							<span style={{ whiteSpace: "pre-wrap" }}>{this.state.success}</span>
							<Button variant="contained" href="/login" >
								Войти
							</Button>
						</>
					}
					{this.state.error &&
						<span>{this.state.error}</span>
					}
				</form>
			</div >
		);
	}
}

export default ForgetPass;