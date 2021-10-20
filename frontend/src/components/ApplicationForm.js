import axios from 'axios';
import React from 'react';
import { getToken } from '../utils/Common';
import { KINDOFTOURISM } from '../utils/Constants';

export default class ApplicationForm extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			mail: "IVAN@IVANOV.RU",
			groupName: "FIITURFU",
			generalArea: "IZHEVSK",
			localArea: "EKB",
			routeStartDate: new Date(),
			routeEndDate: new Date(),
			coordinator: "TEST",
			routeBook: null,
			routeDifficulty: 1,
			numberParticipants: 1,
			kindTourism: "Лыжи",
			coordinatorInfo: "TEST",
			insuranceInfo: "INFO"

		};
		this.onSubmit = this.onSubmit.bind(this);
		this.onRouteBookFileChange = this.onRouteBookFileChange.bind(this);
		this.changeInputRegister = this.changeInputRegister.bind(this);
		this.renderInput = this.renderInput.bind(this);

	}

	onRouteBookFileChange(event) {
		this.setState({ [event.target.name]: event.target.files[0] })
	}

	onSubmit(event) {
		event.preventDefault();

		const { groupName, generalArea, localArea, routeStartDate, routeEndDate,
			insuranceInfo, coordinatorInfo, kindTourism, routeDifficulty, numberParticipants } = this.state;

		const formTrip = new FormData()
		formTrip.append("kind", KINDOFTOURISM[kindTourism]);
		formTrip.append("group_name", groupName);
		formTrip.append("difficulty_category", routeDifficulty);
		formTrip.append("global_region", generalArea);
		formTrip.append("local_region", localArea);
		formTrip.append("start_date", routeStartDate);
		formTrip.append("end_date", routeEndDate);
		formTrip.append("coordinator_info", coordinatorInfo);
		formTrip.append("insurance_info", insuranceInfo);
		formTrip.append("participants_count", numberParticipants);

		let config = {
			headers: {
				Authorization: 'Token ' + getToken()
			}
		};

		axios.post("http://localhost:8000/api/trips",
			formTrip
		,config).then(respForm => {
			const form = new FormData()
			form.append("file", this.state.routeBook);
			form.append("trip", parseInt(respForm.data.id))
			axios.post(`http://localhost:8000/api/trips/${respForm.data.id}/documents`,
				form
			)
		})
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

	renderInput(text, type, id, name, value, onChange){
		return (
			<p>{text}: <input
						type={type}
						id={id}
						name={name}
						value={value}
						onChange={onChange}
						required
					/>
					</p>
		);
	}

	render() {
		return (
			<div>
				<br />Форма подачи заявки
				<form onSubmit={this.onSubmit}>
					{this.renderInput("Email","email","email","mail", this.state.mail, this.changeInputRegister)}
					<p>Вид спорта:
						<select value={this.state.kindTourism}
							onChange={this.changeInputRegister}
							name="kindTourism"
							required>
							<option value="Лыжи">Лыжи</option>
							<option value="Лыжи">Лыжи</option>
							<option value="Лыжи">Лыжи</option>
							<option value="Лыжи">Лыжи</option>
						</select>
					</p>
					{this.renderInput("Название группы","text","groupName","groupName", this.state.groupName, this.changeInputRegister)}
					{this.renderInput("Сложность","number","routeDifficulty","routeDifficulty", this.state.routeDifficulty, this.changeInputRegister)}
					{this.renderInput("Координатор","text","coordinatorInfo","coordinatorInfo", this.state.coordinatorInfo, this.changeInputRegister)}
					{this.renderInput("insuranceInfo","text","insuranceInfo","insuranceInfo", this.state.insuranceInfo, this.changeInputRegister)}
					{this.renderInput("Общий район","text","generalArea","generalArea", this.state.generalArea, this.changeInputRegister)}
					{this.renderInput("Район","text","localArea","localArea", this.state.localArea, this.changeInputRegister)}
					{this.renderInput("Дата начала маршрута","date","routeStartDate","routeStartDate", this.state.routeStartDate, this.changeInputRegister)}
					{this.renderInput("Дата выхода с маршрута","date","routeEndDate","routeEndDate", this.state.routeEndDate, this.changeInputRegister)}
					<input type="file" name="routeBook" onChange={this.onRouteBookFileChange} />

					<input type="submit" />
				</form>
			</div>
		)
	}
}