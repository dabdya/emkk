import React from 'react';
import { getUser, removeUserSession } from '../utils/Common';


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
		await fetch("http://localhost:8000/api/trips")
			.then(res => res.json())
			.then(
				(result) => {
					this.setState({
						trips: result
					});
				},
				(error) => {
					this.setState({
						isLoaded: true,
						error
					});
				})
		console.log(this.state.trips);
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