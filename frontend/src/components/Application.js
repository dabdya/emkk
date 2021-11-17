import React from 'react';
import { Grid, Box } from '@mui/material'
import { KINDOFTOURISM, GLOBALAREA } from '../utils/Constants';
import { ScrollContainer, Button, Select, ComboBox } from '@skbkontur/react-ui'
import Requests from '../utils/requests';
import { getToken } from '../utils/Common';


export default class Application extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			id: -1,
			isEditing: false,
		};

		this.changeEditing = this.changeEditing.bind(this);
		this.changeTourismKind = this.changeTourismKind.bind(this);
		this.changeComboBox = this.changeComboBox.bind(this);
		this.onSubmit = this.onSubmit.bind(this);

	}

	async componentDidMount() {
		const config = {
			headers: {
				Authorization: 'Token ' + getToken()
			}
		};
		const request = new Requests();
		await request.get(`http://localhost:8000/api/trips/${this.props.location.state}`, config)
			.then(response => {
				this.setState({
					id: response.data.id,
					group_name: response.data.group_name,
					leader: response.data.leader,
					global_region: response.data.global_region,
					local_region: response.data.local_region,
					participants_count: response.data.participants_count,
					difficulty_category: response.data.difficulty_category,
					kind: response.data.kind,
					start_date: response.data.start_date,
					end_date: response.data.end_date,
					coordinator_name: response.data.coordinator_name,
					coordinator_phone_number: response.data.coordinator_phone_number
				})
			})
			.catch(err => console.error(err));

	}

	changeTourismKind(value) {
		this.setState((prev) => {
			return {
				...prev,
				kind: KINDOFTOURISM[value]
			}
		})
	};

	changeComboBox(event) {
		this.setState((prev) => {
			return {
				...prev,
				global_region: event.value
			}
		})
	};

	async onSubmit(event) {
		event.preventDefault();
		const { id, isEditing, ...data } = this.state;
		const request = new Requests();
		const config = {
			headers: {
				Authorization: 'Token ' + getToken()
			}
		};
		await request.patch(`http://localhost:8000/api/trips/${id}`, data, config)
			.then(resp => {
				console.log(resp);
			})
	}

	changeEditing() {
		this.setState({ isEditing: !this.state.isEditing })
	}

	render() {
		const { isEditing } = this.state;
		const tourismVariants = ["Пеший", "Лыжный", "Водный", "Горный", "Пеше-водный",
			"Спелео", "Велотуризм", "Парусный", "Конный", "Авто-мото"];
		const getItems = query =>
			Promise.resolve(
				GLOBALAREA.map(item => { return { value: item, label: item } })
					.filter(item => item.value.toLowerCase().startsWith(query.toLowerCase()))
			);
		return (
			<div>
				<ScrollContainer>
					<form onSubmit={this.onSubmit}>
						<h1 style={{ fontSize: 40 }}>Заявка {this.state.group_name}</h1>
						<div style={{ marginLeft: 15, height: "fit-content", width: "700px" }}>
							<h2 style={{ fontWeight: "normal" }}>Имя руководителя: {isEditing ? <input defaultValue={this.state.leader?.first_name} /> : this.state.leader?.first_name}</h2>
							<h2 style={{ fontWeight: "normal" }}>Общий район:
								{isEditing ? <ComboBox drawArrow={true} getItems={getItems}
									value={{ value: this.state.global_region, label: this.state.global_region }}
									onValueChange={this.changeComboBox} name="generalArea" /> : this.state.global_region}</h2>
							<h2 style={{ fontWeight: "normal" }}>Локальный район: {isEditing ? <input defaultValue={this.state.local_region} /> : this.state.local_region}</h2>
							<h2 style={{ fontWeight: "normal" }}>Число участников: {isEditing ? <input type="text" pattern="^[ 0-9]+$" defaultValue={this.state.participants_count} /> : this.state.participants_count}</h2>
							<h2 style={{ fontWeight: "normal" }}>Сложность маршрута: {isEditing ? <input type="text" pattern="[123456]" defaultValue={this.state.difficulty_category} /> : this.state.difficulty_category}</h2>
							<h2 style={{ fontWeight: "normal" }}>Вид туризма:
								{isEditing ? <Select width="207px" items={tourismVariants}
									value={KINDOFTOURISM[this.state.kind]}
									onValueChange={this.changeTourismKind} required /> : KINDOFTOURISM[this.state.kind]}</h2>
							<h2 style={{ fontWeight: "normal" }}>Дата начала маршрута: {isEditing ? <input defaultValue={this.state.start_date} /> : this.state.start_date}</h2>
							<h2 style={{ fontWeight: "normal" }}>Дата окончания маршрута: {isEditing ? <input defaultValue={this.state.end_date} /> : this.state.end_date}</h2>
							<Button onClick={this.changeEditing}>Редактировать</Button>
							{isEditing && <Button type="submit" >Сохранить</Button>}
						</div>
					</form>
					<div>
						<hr />
					</div>
					<div style={{ marginTop: 15, height: "300px" }}>
						Документы
					</div>
					<div>
						<hr />
					</div>
					<div style={{ marginTop: 15, height: "500px" }}>
						Рецензии
					</div>
				</ScrollContainer >
			</div >
		)
	}
}