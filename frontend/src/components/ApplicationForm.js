import axios from 'axios';
import React from 'react';
import { getToken } from '../utils/Common';
import { KINDOFTOURISM, GLOBALAREA } from '../utils/Constants';
import HelpDotIcon from '@skbkontur/react-icons/HelpDot';
import { Button, Center, Input, Gapped, Link, ScrollContainer, Tooltip, ComboBox } from '@skbkontur/react-ui';

export default class ApplicationForm extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			// mail: "IVAN@IVANOV.RU",
			groupName: "FIITURFU",
			leaderFullName: "Abobka",
			generalArea: "IZHEVSK",
			localArea: "EKB",
			routeStartDate: new Date(),
			routeEndDate: new Date(),
			coordinator: "TEST",
			routeBook: null,
			cartographicMaterial: null,
			participantsReferences: null,
			insurancePolicyScans: null,
			routeDifficulty: 1,
			numberParticipants: 1,
			kindTourism: "Лыжи",
			coordinatorInfo: "TEST",
			insuranceInfo: "INFO"

		};
		this.hiddenFileInput = React.createRef(null);
		this.handleClick = this.handleClick.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.onFileChange = this.onFileChange.bind(this);
		this.changeInputRegister = this.changeInputRegister.bind(this);
		this.renderInput = this.renderInput.bind(this);
		this.renderFileUpload = this.renderFileUpload.bind(this);
		this.ToolTipForRouteBook = this.ToolTipForRouteBook.bind(this);
		this.ToolTipForCartographic = this.ToolTipForCartographic.bind(this);
		this.ToolTipForReferences = this.ToolTipForReferences.bind(this);
		this.ToolTipForInsuranceScans = this.ToolTipForInsuranceScans.bind(this);
		this.changeComboBox = this.changeComboBox.bind(this);
		this.renderItem = this.renderItem.bind(this);
	}

	onFileChange(event) {
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
		formTrip.append("participants_count", numberParticipants);//Как добавят ФИО руководителя и емейл на бэке, заапендить в формТрип эти поля.

		let config = {
			headers: {
				Authorization: 'Token ' + getToken()
			}
		};

		axios.post("http://localhost:8000/api/trips",
			formTrip
			, config).then(respForm => {
				const form = new FormData()
				form.append("file", this.state.routeBook);
				form.append("trip", parseInt(respForm.data.id))
				axios.post(`http://localhost:8000/api/trips/${respForm.data.id}/documents`,
					form, config
				)
			})
	}

	handleClick(event) {
		this.hiddenFileInput.current.click();
	};

	changeComboBox(event) {
		this.setState((prev) => {
			return {
				...prev,
				generalArea: event.value
			}
		})
	};

	changeInputRegister(event) {
		event.persist();

		this.setState(prev => {
			return {
				...prev,
				[event.target.name]: event.target.value
			}

		})
	};
	renderInput(text, type, className, id, name, value, onChange) {
		return (
			<div style={{ marginTop: "15px" }}>
				<label htmlFor={name}>{text}</label><br />
				<input autoComplete="new-password" type={type} className={className} id={id} name={name} defaultValue={value} onChange={onChange} required />
			</div>
		);
	}

	ToolTipForRouteBook() {
		return (
			<div style={{ width: 400, fontSize: 16, fontFamily: 'Segoe UI' }}>
				Формат имени файла: ГОД_МЕСЯЦ_ФИОруководителя_Район_категория. документ в формате pdf, doc/docx, xls/xlsx
			</div>
		)
	}
	ToolTipForCartographic() {
		return (
			<div style={{ width: 430, fontSize: 16, fontFamily: 'Segoe UI' }}>
				формат имени файла:
				ГОД_МЕСЯЦ_ФИОруководителя_Район_категория_карта
			</div>
		)
	};
	ToolTipForReferences() {
		return (
			<div style={{ width: 300, fontSize: 16, fontFamily: 'Segoe UI' }}>
				Какие-то справки
			</div>
		)
	};
	ToolTipForInsuranceScans() {
		return (
			<div style={{ width: 430, fontSize: 16, fontFamily: 'Segoe UI' }}>
				формат имени файла: ГОД_МЕСЯЦ_ФИОруководителя_Район_категория_полисы
			</div>
		)
	};

	renderFileUpload(fileName, id, toolTipMethod) {
		return (
			<div style={{ marginTop: "5px" }}>
				<label htmlFor={id}>{fileName}</label><br />
				<Gapped>
					<Button style={{ width: "170px" }} onClick={this.handleClick}>Загрузить</Button>
					<Tooltip render={toolTipMethod} pos="right top">
						<HelpDotIcon />
					</Tooltip>
				</Gapped>
				<input type="file" style={{ display: "none" }} id={id} name={id} ref={this.hiddenFileInput} onChange={this.onFileChange} />
			</div>
		)
	}

	renderItem(item) {
		<Gapped>
			<div style={{ width: 40 }}>{item.value}</div>
			<div style={{ width: 210, whiteSpace: 'normal' }}>{item.label}</div>
		</Gapped>
	};

	render() {
		const getItems = q =>
			Promise.resolve(
				GLOBALAREA.map(item => { return { value: item, label: item } })
					.filter(item => item.value.startsWith(q))
			);
		return (
			<div>
				<ScrollContainer>
					<Center style={{ height: '80vh' }}>
						<br />Форма подачи заявки
						<div>
							<form onSubmit={this.onSubmit}>
								{this.renderInput("Название спортивной организации", "text", "inputField", "groupName", "groupName", this.state.groupName, this.changeInputRegister)}
								{this.renderInput("ФИО руководителя", "text", "inputField", "leaderFullName", "leaderFullName", this.state.leaderFullName, this.changeInputRegister)}
								{/* {this.renderInput("Email","email","inputField","email","mail", this.state.mail, this.changeInputRegister)} */}
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
								{this.renderInput("Сложность", "number", "routeDifficulty", "routeDifficulty", "routeDifficulty", this.state.routeDifficulty, this.changeInputRegister)}
								{this.renderInput("Координатор", "text", "inputField", "coordinatorInfo", "coordinatorInfo", this.state.coordinatorInfo, this.changeInputRegister)}
								{this.renderInput("Информация о страховой компании", "text", "inputField", "insuranceInfo", "insuranceInfo", this.state.insuranceInfo, this.changeInputRegister)}
								<ComboBox getItems={getItems} value={{ value: this.state.generalArea, label: this.state.generalArea }} onValueChange={this.changeComboBox} />								
								{this.renderInput("Район", "text", "localArea", "localArea", "localArea", this.state.localArea, this.changeInputRegister)}
								{this.renderInput("Дата начала маршрута", "date", "routeStartDate", "routeStartDate", "routeStartDate", this.state.routeStartDate, this.changeInputRegister)}
								{this.renderInput("Дата выхода с маршрута", "date", "routeEndDate", "routeEndDate", "routeEndDate", this.state.routeEndDate, this.changeInputRegister)}
								<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
									<Button type="submit">Подать заявку</Button>
								</div>
							</form>
						</div>
						<div>
							{this.renderFileUpload("Маршрутная книжка", "routeBook", this.ToolTipForRouteBook)}
							{this.renderFileUpload("Картографический материал", "cartographicMaterial", this.ToolTipForCartographic)}
							{this.renderFileUpload("Справки участников", "participantsReferences", this.ToolTipForReferences)}
							{this.renderFileUpload("Сканы страховых полисов", "insurancePolicyScans", this.ToolTipForInsuranceScans)}
						</div>
					</Center>
				</ScrollContainer>
			</div>
		)
	}
}