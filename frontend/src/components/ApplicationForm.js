import axios from 'axios';
import React from 'react';
import { getToken } from '../utils/Common';
import { KINDOFTOURISM, GLOBALAREA } from '../utils/Constants';
import HelpDotIcon from '@skbkontur/react-icons/HelpDot';
import { Button, Center, Input, Gapped, Link, ScrollContainer, Tooltip, ComboBox, Select} from '@skbkontur/react-ui';
import Requests from '../utils/requests';
import { Grid, Box } from '@mui/material'

export default class ApplicationForm extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			// mail: "IVAN@IVANOV.RU",
			groupName: "",
			leaderFullName: "", // не нужен
			generalArea: "Поиск...	",
			localArea: "",
			startRouteLocality: "", // населенный пункт начала маршрута
			endRouteLocality: "", // населенный пункт окончания маршрута
			routeStartDate: new Date(),
			routeEndDate: new Date(),
			realStartRouteDate: new Date(), // контрольный срок сообщения о начале маршрута
			realEndRouteDate: new Date(), // контрольный срок сообщения об окончании маршрута
			routeBook: null,
			cartographicMaterial: null,
			participantsReferences: null,
			insurancePolicyScans: null,
			routeDifficulty: 1,
			participantsNumber: 1,
			tourismKind: "",
			coordinatorName: "", // два поля: имя координатора и его телефон. Было одно -- coordinatorInfo
			coordinatorPhoneNumber: "",
			insuranceCompanyName: "",
			insurancePolicyValidityDuration: new Date(),

		};
		this.hiddenFileInputRoute = React.createRef(null);
		this.hiddenFileInputCartographic = React.createRef(null);
		this.hiddenFileInputParticipants = React.createRef(null);
		this.hiddenFileInputInsurance = React.createRef(null);
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
		this.changeTourismKind = this.changeTourismKind.bind(this);
		this.tourismVariants = ["Пеший", "Лыжный", "Водный", "Горный", "Пеше-водный",
			"Спелео", "Велотуризм", "Парусный", "Конный", "Авто-мото"]
		// this.renderItem = this.renderItem.bind(this);
	}

	onFileChange(event) {
		this.setState({ [event.target.name]: event.target.files[0] })
	}

	async onSubmit(event) {
		event.preventDefault();

		const { groupName, generalArea, localArea, routeStartDate, routeEndDate,
			insuranceInfo, coordinatorInfo, tourismKind, routeDifficulty, participantsNumber } = this.state;

		const formTrip = new FormData()
		formTrip.append("kind", KINDOFTOURISM[tourismKind]);
		formTrip.append("group_name", groupName);
		formTrip.append("difficulty_category", routeDifficulty);
		formTrip.append("global_region", generalArea);
		formTrip.append("local_region", localArea);
		formTrip.append("start_date", routeStartDate);
		formTrip.append("end_date", routeEndDate);
		formTrip.append("coordinator_info", coordinatorInfo);
		formTrip.append("insurance_info", insuranceInfo);
		formTrip.append("participants_count", participantsNumber);//Как добавят ФИО руководителя и емейл на бэке, заапендить в формТрип эти поля.

		let config = {
			headers: {
				Authorization: 'Token ' + getToken()
			}
		};
		const request = new Requests();
		await request.post("http://localhost:8000/api/trips",
			formTrip
			, config).then(respForm => {
			let form = new FormData()
			form.append("file", this.state.routeBook);
			form.append("trip", parseInt(respForm.data.id))
			axios.post(`http://localhost:8000/api/trips/${respForm.data.id}/documents`,
				form, config
			);
			form = new FormData()
			form.append("file", this.state.cartographicMaterial);
			form.append("trip", parseInt(respForm.data.id))
			axios.post(`http://localhost:8000/api/trips/${respForm.data.id}/documents`,
				form, config
			);
			form = new FormData()
			form.append("file", this.state.participantsReferences);
			form.append("trip", parseInt(respForm.data.id))
			axios.post(`http://localhost:8000/api/trips/${respForm.data.id}/documents`,
				form, config
			)
			form = new FormData()
			form.append("file", this.state.insurancePolicyScans);
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

	changeTourismKind(event) {
		this.setState((prev) => {
			return {
				...prev,
				tourismKind: event.value
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
	renderInput(text, type, className, id, name, value, onChange, placeholder) {
		return (
			<Grid item xs={5}>
				<label htmlFor={name}>{text}</label><br />
				<input autoComplete="new-password" type={type} className={className} id={id} name={name}
					   defaultValue={value} onChange={onChange} placeholder={placeholder} required />
			</Grid>
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

	renderFileUpload(fileName, name, ref, toolTipMethod) {
		return (
			<Grid item xs={5}>
				<label >{fileName}</label><br />
				<Gapped>
					<Button style={{ width: "317px" }} onClick={() => { ref.current.click() }}>Загрузить</Button>
					<Tooltip render={toolTipMethod} pos="right top">
						<HelpDotIcon />
					</Tooltip>
				</Gapped>
				<input type="file" style={{ display: "none" }} name={name} ref={ref} onChange={this.onFileChange} />
			</Grid>
		)
	}
	//
	// renderItem(item) {
	// 	<Gapped>
	// 		<div style={{ width: 40 }}>{item.value}</div>
	// 		<div style={{ width: 210, whiteSpace: 'normal' }}>{item.label}</div>
	// 	</Gapped>
	// };

	render() {
		const getItems = query =>
			Promise.resolve(
				GLOBALAREA.map(item => { return { value: item, label: item } })
					.filter(item => item.value.startsWith(query))
			);
		return (
			<div>
				<Center>
					<form onSubmit={this.onSubmit}>
						<Box sx={{ flexGrow: 1 }}>
							<Grid container spacing={3}>
								<Grid item xs={5}>
									<label htmlFor="groupName">Название спортивной организации</label><br />
									<input autoComplete="new-password" type='text' className="formInputField" id="groupName" name="groupName"
										   defaultValue={this.state.groupName} onChange={this.changeInputRegister} placeholder="Команда Дятлова" required />
								</Grid>

								<Grid item xs={5}>
									<label htmlFor="coordinatorName">ФИО координатора</label><br />
									<input autoComplete="new-password" type='text' className="formInputField" id="coordinatorName" name="coordinatorName"
										   defaultValue={this.state.coordinatorName} onChange={this.changeInputRegister}
										   placeholder="Иванов Иван Иванович" required />
								</Grid>
								<Grid item xs={5}>
									<label htmlFor="generalArea">Общий район</label><br />
									<ComboBox style={{border: "0.4px solid"}} drawArrow={true} size="medium" width={317} getItems={getItems}
											  value={{ value: this.state.generalArea, label: this.state.generalArea }}
											  onValueChange={this.changeComboBox} name="generalArea"/>
								</Grid>
								<Grid item xs={5}>
									<label htmlFor="coordinatorPhoneNumber">Контактный телефон координатора</label><br />
									<input autoComplete="new-password" type='text' className="formInputField" id="coordinatorPhoneNumber" name="coordinatorPhoneNumber"
										   defaultValue={this.state.coordinatorPhoneNumber} onChange={this.changeInputRegister}
										   placeholder="+7(999)-111-22-33" required />
								</Grid>
								<Grid item xs={5}>
									<label htmlFor="startRouteLocality">Населенный пункт начала маршрута</label><br />
									<input autoComplete="new-password" type='text' className="formInputField" id="startRouteLocality" name="startRouteLocality"
										   defaultValue={this.state.startRouteLocality} onChange={this.changeInputRegister} required />
								</Grid>
								<Grid item xs={5}>
									<label htmlFor="localArea">Локальный район</label><br />
									<input autoComplete="new-password" type='text' className="formInputField" id="localArea" name="localArea"
										   defaultValue={this.state.localArea} onChange={this.changeInputRegister} required />
								</Grid>
								<Grid item xs={5}>
									<label htmlFor="realStartRouteDate">Контрольный срок сообщения о начале маршрута</label><br />
									<input autoComplete="new-password" type='date' className="formInputField" id="realStartRouteDate" name="realStartRouteDate"
										   defaultValue={this.state.realStartRouteDate} onChange={this.changeInputRegister} required />
								</Grid>
								<Grid item xs={5}>
									<label htmlFor="tourismKind">Вид туризма</label><br />
									<Select size="medium" width={317} items={this.tourismVariants}
											value={this.state.tourismKind} // почему-то value убирает плейсхолдер "ничего не выбрано"
											onValueChange={this.changeTourismKind} required/>
								</Grid>
								<Grid item xs={5}>
									<label htmlFor="endRouteLocality">Населенный пункт окончания маршрута</label><br />
									<input autoComplete="new-password" type='text' className="formInputField" id="endRouteLocality" name="endRouteLocality"
										   defaultValue={this.state.endRouteLocality} onChange={this.changeInputRegister} required />
								</Grid>
								<Grid item xs={5}>
									<label htmlFor="routeStartDate">Дата выхода на маршрут</label><br />
									<input autoComplete="new-password" type='date' className="formInputField" id="routeStartDate" name="routeStartDate"
										   defaultValue={this.state.routeStartDate} onChange={this.changeInputRegister} required />
								</Grid>
								<Grid item xs={5}>
									<label htmlFor="realEndRouteDate">Контрольный срок сообщения об окончании маршрута</label><br />
									<input autoComplete="new-password" type='date' className="formInputField" id="realEndRouteDate" name="realEndRouteDate"
										   defaultValue={this.state.realEndRouteDate} onChange={this.changeInputRegister} required />
								</Grid>
								<Grid item xs={5}>
									<label htmlFor="routeEndDate">Дата окончания маршрута</label><br />
									<input autoComplete="new-password" type='date' className="formInputField" id="routeEndDate" name="routeEndDate"
										   defaultValue={this.state.routeEndDate} onChange={this.changeInputRegister} required />
								</Grid>
								<Grid item xs={5}>
									{this.renderFileUpload("Маршрутная книжка", "routeBook", this.hiddenFileInputRoute, this.ToolTipForRouteBook)}
								</Grid>
								<Grid item xs={5}>
									<label htmlFor="participantsNumber">Количество человек</label><br />
									<input autoComplete="new-password" type='text' className="formInputField" id="participantsNumber" name="participantsNumber"
										   defaultValue={this.state.participantsNumber} onChange={this.changeInputRegister} required />
								</Grid>
								<Grid item xs={5}>
									{this.renderFileUpload("Картографический материал",
										"cartographicMaterial", this.hiddenFileInputCartographic, this.ToolTipForCartographic)}
								</Grid>
								<Grid item xs={5}>
									<label htmlFor="insuranceCompanyName">Наименование страховой компании</label><br />
									<input autoComplete="new-password" type='text' className="formInputField" id="insuranceCompanyName" name="insuranceCompanyName"
										   defaultValue={this.state.insuranceCompanyName} onChange={this.changeInputRegister} required />
								</Grid>
								{/*<Grid item xs={5}>*/}
								{this.renderFileUpload("Справки участников", "participantsReferences",
									this.hiddenFileInputParticipants, this.ToolTipForReferences)}
								{/*</Grid>*/}
								<Grid item xs={5}>
									<label htmlFor="insurancePolicyValidityDuration">Срок действия страховых полисов</label><br />
									<input autoComplete="new-password" type='date' className="formInputField"
										   id="insurancePolicyValidityDuration" name="insurancePolicyValidityDuration"
										   defaultValue={this.state.insurancePolicyValidityDuration} onChange={this.changeInputRegister} required />
								</Grid>
								<Grid item xs={5}>
									{this.renderFileUpload("Сканы страховых полисов", "insurancePolicyScans",
										this.hiddenFileInputInsurance, this.ToolTipForInsuranceScans)}
								</Grid>
								<Grid item xs={5}>
									<label htmlFor="routeDifficulty">Категория сложности</label><br />
									<input autoComplete="new-password" type='text' className="formInputField"
										   id="routeDifficulty" name="routeDifficulty"
										   defaultValue={this.state.routeDifficulty} onChange={this.changeInputRegister} required />
								</Grid>
							</Grid>
						</Box>
					</form>
				</Center>
			</div>
		)
	}

}