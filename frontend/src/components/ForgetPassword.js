import React from "react";
import { Button } from "@skbkontur/react-ui";

export default class ForgetPass extends React.Component {

	constructor(props) {
		super(props);

		this.state = { login: '', error: null };
		this.onSubmit = this.onSubmit.bind(this);

	}

	onSubmit(e) {
		e.preventDefault();
		//Бэкенд как обычно отстаёт...
		this.props.history.push("/");
	}

	render() {
		return (
			<div>
				<form onSubmit={this.onSubmit}>
					<div>
						<label>Email:</label><br />
						<input type="email" value={this.state.login}
							onChange={(e) => { this.setState({ login: e.target.value }); }} />
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