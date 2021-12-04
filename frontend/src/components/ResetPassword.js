import React from "react";
import { Button } from "@skbkontur/react-ui";
import jwt_decode from "jwt-decode";
import Requests from "../utils/requests";
import { getToken, setResetSession } from "../utils/Common";

export default class ResetPass extends React.Component {

	constructor(props) {
		super(props);
		this.reset_token = this.props.match.params.token;
		this.state = { password: "", second_password: "" };
		this.onSubmit = this.onSubmit.bind(this);

	}

	async onSubmit(e) {
		e.preventDefault();
		await new Requests().patch(`${process.env.REACT_APP_URL}/auth/user`,
			{
				user: {
					password: this.state.password
				},
				reset_token: 'Token ' + this.reset_token
			}
		).then(resp => {
			console.log(resp);
		})

	}

	render() {
		return (
			<div>
				<form onSubmit={this.onSubmit}>
					<div>
						<label>Новый пароль:</label><br />
						<input type="text" value={this.state.password}
							onChange={(e) => { this.setState({ password: e.target.value }); }} />
						<label>Новый пароль ещё раз:</label><br />
						<input type="text" value={this.state.second_password}
							onChange={(e) => { this.setState({ second_password: e.target.value }); }} />
					</div>
					<Button type="submit">
						Восстановить пароль
					</Button>
					{/* Ошибку обработать */}
				</form>
			</div>
		);
	}
}