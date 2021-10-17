import axios from 'axios';
import React from 'react';
import validator from 'validator';
import { KINDOFTOURISM } from '../utils/Constants';

export default class ApplicationForm extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			mail: "IVAN@IVANOV.RU",
			groupName: "FIITURFU",
			leaderId: 1,
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

	}

	onRouteBookFileChange(event) {
		this.setState({ [event.target.name]: event.target.files[0] })
	}

	onSubmit(event) {
		event.preventDefault();

		const { groupName, generalArea, routeStartDate, routeEndDate, leaderId,
			insuranceInfo, coordinatorInfo, kindTourism, routeDifficulty, numberParticipants } = this.state;

		const formTrip = new FormData()
		formTrip.append("kind", KINDOFTOURISM[kindTourism]);
		formTrip.append("group_name", groupName);
		formTrip.append("difficulty_category", routeDifficulty);
		formTrip.append("district", generalArea);
		formTrip.append("start_date", routeStartDate);
		formTrip.append("end_date", routeEndDate);
		formTrip.append("coordinator_info", coordinatorInfo);
		formTrip.append("insurance_info", insuranceInfo);
		formTrip.append("leader", leaderId);
		formTrip.append("participants_count", numberParticipants);


		axios.post("http://localhost:8000/api/trips",
			formTrip
		).then(respForm => {
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
		debugger;
		this.setState(prev => {
			return {
				...prev,
				[event.target.name]: event.target.value
			}

		})
	};

	render() {
		return (
			<div>
				<br />Форма подачи заявки
				<form onSubmit={this.onSubmit}>
					<p>Email: <input
						type="email"
						id="email"
						name="mail"
						value={this.state.mail}
						onChange={this.changeInputRegister}

					/>
					</p>
					<p>Вид спорта:
						<select value={this.state.kindTourism}
							onChange={this.changeInputRegister}
							name="kindTourism">
							<option value="Лыжи">Лыжи</option>
							<option value="Лыжи">Лыжи</option>
							<option value="Лыжи">Лыжи</option>
							<option value="Лыжи">Лыжи</option>
						</select>
					</p>
					<p>Название группы: <input
						type="text"
						id="groupName"
						name="groupName"
						value={this.state.groupName}
						onChange={this.changeInputRegister}
						formNoValidate
					/>
					</p>
					<p>Сложность: <input
						type="number"
						id="routeDifficulty"
						name="routeDifficulty"
						value={this.state.routeDifficulty}
						onChange={this.changeInputRegister}
					/>
					</p>
					<p>ФИО руководителя группы<input
						type="text"
						id="leaderId"
						name="leaderId"
						value={this.state.leaderId}
						onChange={this.changeInputRegister}
					/>
					</p>
					<p>Координатор: <input
						type="text"
						id="coordinatorInfo"
						name="coordinatorInfo"
						value={this.state.coordinatorInfo}
						onChange={this.changeInputRegister}
					/>
					</p>
					<p>insuranceInfo: <input
						type="text"
						id="insuranceInfo"
						name="insuranceInfo"
						value={this.state.insuranceInfo}
						onChange={this.changeInputRegister}
					/>
					</p>
					<p>Общий район<input // комбо-бокс. общий район из справочника выбрать 
						type="text"
						id="generalArea"
						name="generalArea"
						value={this.state.generalArea}
						onChange={this.changeInputRegister}
					/>
					</p>
					<p>Район <input
						type="text"
						id="localArea"
						name="localArea"
						value={this.state.localArea}
						onChange={this.changeInputRegister}
					/>
					</p>
					<p>Дата начала маршрута <input
						type="date"
						id="routeStartDate"
						name="routeStartDate"
						value={this.state.routeStartDate}
						onChange={this.changeInputRegister}
					/>
					</p>
					<p>Дата выхода с маршрута <input
						type="date"
						id="routeEndDate"
						name="routeEndDate"
						value={this.state.routeEndDate}
						onChange={this.changeInputRegister}
					/>
					</p>
					<input type="file" name="routeBook" onChange={this.onRouteBookFileChange} />

					<input type="submit" />
				</form>
			</div>
		)
	}
}