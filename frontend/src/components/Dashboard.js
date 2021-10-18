import axios from 'axios';
import React from 'react';
import { getToken, getUser, removeUserSession } from '../utils/Common';


export default class Dashboard extends React.Component {

	constructor(props) {
		super(props);
		this.user = getUser();
		this.state = {
			error: null,
			isLoaded: false,
			trips: [],
		};
		this.handleLogout = this.handleLogout.bind(this);
	}

	async componentDidMount() {
		let config = {
			headers: {
				Authorization: 'Token ' + getToken() //the token is a variable which holds the token
			}
		};
		await axios.get("http://localhost:8000/api/trips",config)
			.then(
				(result) => {
					this.setState({
						trips: result.data
					});
				},
				(error) => {
					this.setState({
						isLoaded: true,
						error
					});
				})
	}


	// handle click event of logout button
	handleLogout() {
		removeUserSession();

		this.props.history.push('/login');
	};

	render() {
		return (
			<div>
				Welcome {this.user}!<br /><br />
				Здесь находится информация только для авторизованных пользователей <br /> <br />
				<input type="button" onClick={this.handleLogout} value="Logout" />
				<ul>
					<li> {"Создан"} {"Район"} {"Вид туризма"} {"Сложность"} {"Статус"} {"Обновлён"} </li>
					{this.state.trips.map(trip => (
						<li key={trip.id}>
							{"Дата создания"} {trip.district} {trip.kind} {trip.difficulty_category} {trip.status} {"Дата обновления"}
						</li>
					))}
				</ul>
			</div>
		);
	}
}