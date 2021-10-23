import React from 'react';
import { getToken, getUser, removeUserSession } from '../utils/Common';
import Requests from '../utils/requests';


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
		const request = new Requests();
		await request.get("http://localhost:8000/api/trips", config)
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

	renderTable() {

	}

	render() {
		return (
			<div className="table">
					<button onClick={this.handleLogout} value="Logout" />
					<table className="table">
						<thead>
							<tr>
								<th>ФИО Руководителя</th>
								<th>Общий район</th>
								<th>Вид туризма</th>
								<th>Сложность</th>
								<th>Статус</th>
								<th>Дата начала</th>
								<th>Дата конца</th>
							</tr>
						</thead>
						<tbody>
							{this.state.trips.map(trip => (
								<tr key={trip.id}>
									<td>{trip.coordinator_info}</td>
									<td>{trip.global_region}</td>
									<td>{trip.kind}</td>
									<td>{trip.difficulty_category}</td>
									<td>{trip.status}</td>
									<td>{trip.start_date}</td>
									<td>{trip.end_date}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
		);
	}
}