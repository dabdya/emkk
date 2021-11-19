import React from 'react';
import { KINDOFTOURISM, GLOBALAREA } from '../utils/Constants';
import { ScrollContainer, Button, Select, ComboBox } from '@skbkontur/react-ui'
import Requests from '../utils/requests';
import { getToken } from '../utils/Common';
import axios from 'axios';

export default class Application extends React.Component {

	requests = new Requests();
	constructor(props) {
		super(props);
		this.state = {
			id: -1,
			isEditing: false,
			files: [],
			reviews: [],
		};

		this.changeEditing = this.changeEditing.bind(this);
		this.changeTourismKind = this.changeTourismKind.bind(this);
		this.changeComboBox = this.changeComboBox.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.createBlob = this.createBlob.bind(this);
		this.deleteDocument = this.deleteDocument.bind(this);
		this.addDocument = this.addDocument.bind(this);
		this.config = this.config.bind(this);


	}

	config() {
		return {
			headers: {
				Authorization: 'Token ' + getToken()
			}
		}
	};

	async componentDidMount() {
		await this.requests.get(`${process.env.REACT_APP_URL}/api/trips/${this.props.location.state}`, this.config())
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

		await this.requests.get(`${process.env.REACT_APP_URL}/api/trips/${this.props.location.state}/documents`, this.config())
			.then(async resp => {
				resp.data.forEach(async el => {
					await this.requests.get(`${process.env.REACT_APP_URL}/api/trips/${this.props.location.state}/documents/${el}`, this.config())
						.then(async response => {
							this.setState(prevState => ({
								files: [...prevState.files, { id: response.data.id, uuid: response.data.uuid, filename: response.data.filename }]
							}))

						})
				});
			});

		await this.requests.get(`${process.env.REACT_APP_URL}/api/trips/${this.props.location.state}/reviews`, this.config())
			.then(resp => {
				this.setState({ reviews: resp.data });
			})
			.catch(err => console.error(err));
	};

	changeTourismKind(value) {
		this.setState((prev) => {
			return {
				...prev,
				kind: KINDOFTOURISM[value]
			}
		})
	};

	async createBlob(e, file) {
		e.preventDefault();
		let mime;
		const resp = await axios.get(`${process.env.REACT_APP_URL}/api/${file.uuid}`, { responseType: 'arraybuffer' })
			.then(resp => {
				mime = resp.headers["content-type"];
				return resp;
			})
		const blob = new Blob([resp.data], { type: mime });
		window.open(URL.createObjectURL(blob));
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
		const { id, isEditing, files, reviews, ...data } = this.state;
		await this.requests.patch(`${process.env.REACT_APP_URL}/api/trips/${id}`, data, this.config())
			.then(resp => {
				this.changeEditing();
			})
	}

	changeEditing() {
		this.setState({ isEditing: !this.state.isEditing })
	}

	async deleteDocument(file) {
		await this.requests.delete(`${process.env.REACT_APP_URL}/api/trips/${this.props.location.state}/documents/${file.id}`,
			this.config())
			.then(response => {
				this.setState(prevState => ({ files: prevState.files.filter(item => item.uuid !== file.uuid) }));
			})
	}

	async addDocument(afile) {
		const files = afile.target.files;

		const form = new FormData()
		for (const file of files) {
			form.append("file", file);
		}

		await this.requests.post(`${process.env.REACT_APP_URL}/api/trips/${this.props.location.state}/documents`, form,
			this.config())
			.then(resp => {
				for (const item of resp.data) {
					this.setState(prevState => ({ files: [...prevState.files, { id: item.id, uuid: item.uuid, filename: item.filename }] }));
				}
			})
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
							<h2 style={{ fontWeight: "normal" }}>Имя руководителя: {this.state.leader?.first_name}</h2>
							<h2 style={{ fontWeight: "normal" }}>Общий район:
								{isEditing ? <ComboBox drawArrow={true} getItems={getItems}
									value={{ value: this.state.global_region, label: this.state.global_region }}
									onValueChange={this.changeComboBox} name="generalArea" /> : this.state.global_region}</h2>
							<h2 style={{ fontWeight: "normal" }}>Локальный район: {isEditing ? <input defaultValue={this.state.local_region} onChange={e => this.setState({ local_region: e.target.value })} /> : this.state.local_region}</h2>
							<h2 style={{ fontWeight: "normal" }}>Число участников: {isEditing ? <input type="text" pattern="^[0-9]+$" defaultValue={this.state.participants_count} onChange={e => this.setState({ participants_count: e.target.value })} /> : this.state.participants_count}</h2>
							<h2 style={{ fontWeight: "normal" }}>Сложность маршрута: {isEditing ? <input type="text" pattern="[1-6]" defaultValue={this.state.difficulty_category} onChange={e => this.setState({ difficulty_category: e.target.value })} /> : this.state.difficulty_category}</h2>
							<h2 style={{ fontWeight: "normal" }}>Вид туризма:
								{isEditing ? <Select width="207px" items={tourismVariants}
									value={KINDOFTOURISM[this.state.kind]}
									onValueChange={this.changeTourismKind} required /> : KINDOFTOURISM[this.state.kind]}</h2>
							<h2 style={{ fontWeight: "normal" }}>Дата начала маршрута: {isEditing ? <input type="date" defaultValue={this.state.start_date} onChange={e => this.setState({ start_date: e.target.value })} /> : this.state.start_date}</h2>
							<h2 style={{ fontWeight: "normal" }}>Дата окончания маршрута: {isEditing ? <input type="date" min={this.state.start_date} defaultValue={this.state.end_date} onChange={e => this.setState({ end_date: e.target.value })} /> : this.state.end_date}</h2>
							{!isEditing && <Button onClick={this.changeEditing}>Редактировать</Button>}
							{isEditing && <Button type="submit" >Сохранить</Button>}
						</div>
					</form>
					<div>
						<hr />
					</div>

					<div style={{ marginTop: 15, marginLeft: 15, height: "300px" }}>
						Документы
						<div>
							<ul>
								{
									this.state.files.map(file => {
										return (<li>
											<a onClick={(e) => { this.createBlob(e, file); }} href="#" target="_blank">{file.filename}</a>
											<img onClick={() => this.deleteDocument(file)} alt="delete" />
										</li>);
									})
								}
							</ul>
							<input
								ref="fileInput"
								onChange={this.addDocument}
								type="file"
								style={{ display: "none" }}
								multiple={true}
							/>
							<Button onClick={() => this.refs.fileInput.click()}>Добавить документы</Button>
						</div>
					</div>
					<div>
						<hr />
					</div>
					<div style={{ marginTop: 15, marginLeft: 15, height: "500px" }}>
						Рецензии ({this.state.reviews.length}/2)
					</div>
				</ScrollContainer >
			</div >
		)
	}
}