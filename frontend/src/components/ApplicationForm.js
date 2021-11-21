import axios from 'axios';
import React from 'react';
import { getToken } from '../utils/Common';
import { KINDOFTOURISM, GLOBALAREA } from '../utils/Constants';
import HelpDotIcon from '@skbkontur/react-icons/HelpDot';
import { Button, Center, Gapped, Tooltip, ComboBox, Select } from '@skbkontur/react-ui';
import Requests from '../utils/requests';
import { Grid, Box } from '@mui/material'
import ShowModal from "./ShowModal"

export default class ApplicationForm extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			groupName: "Ivan",
			leaderFullName: "Ivan", // не нужен
			generalArea: "Поиск...	",
			localArea: "Ivan",
			routeStartDate: new Date(),
			routeEndDate: new Date(),
			controlStartDate: new Date(),
			controlEndDate: new Date(),
			controlStartRegion: "деревня Хлопинки",
			controlEndRegion: "деревня икниплоХ",
			routeBook: null,
			cartographicMaterial: null,
			participantsReferences: null,
			insurancePolicyScans: null,
			routeDifficulty: 1,
			participantsNumber: 1,
			tourismKind: null,
			coordinatorName: "1", // два поля: имя координатора и его телефон. Было одно -- coordinatorInfo
			coordinatorPhoneNumber: "1",
			insuranceCompanyName: "1",
			insurancePolicyValidityDuration: new Date(),
			buttonIsPressed: false
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
		this.open = this.open.bind(this);
		this.close = this.close.bind(this);
	}

	onFileChange(event) {
		this.setState({ [event.target.name]: event.target.files[0] })
	}

	async onSubmit(event) {
		event.preventDefault();

		const { groupName, generalArea, localArea, routeStartDate, routeEndDate, insurancePolicyValidityDuration,
			tourismKind, routeDifficulty, participantsNumber, coordinatorName, insuranceCompanyName, coordinatorPhoneNumber, controlStartDate,
			controlEndDate, controlStartRegion, controlEndRegion } = this.state;

		const formTrip = new FormData()
		formTrip.append("kind", KINDOFTOURISM[tourismKind]);
		formTrip.append("group_name", groupName);
		formTrip.append("difficulty_category", routeDifficulty);
		formTrip.append("global_region", generalArea);
		formTrip.append("local_region", localArea);
		formTrip.append("start_date", routeStartDate);
		formTrip.append("end_date", routeEndDate);
		formTrip.append("control_start_date", controlStartDate);
		formTrip.append("control_end_date", controlEndDate);
		formTrip.append("control_start_region", controlStartRegion);
		formTrip.append("control_end_region", controlEndRegion);
		formTrip.append("coordinator_name", coordinatorName);
		formTrip.append("coordinator_phone_number", coordinatorPhoneNumber);
		formTrip.append("insurance_company_name", insuranceCompanyName);
		formTrip.append("insurance_policy_validity_duration", insurancePolicyValidityDuration);
		formTrip.append("participants_count", participantsNumber);

		const config = {
			headers: {
				Authorization: 'Token ' + getToken()
			}
		};
		const request = new Requests();
		await request.post(`${process.env.REACT_APP_URL}/api/trips`,
			formTrip
			, config).then(respForm => {
				this.setState({
					buttonIsPressed: true
				});

				const form = new FormData()
				form.append("trip", parseInt(respForm.data.id))
				form.append("file", this.state.routeBook);
				form.append("file", this.state.cartographicMaterial);
				form.append("file", this.state.participantsReferences);
				form.append("file", this.state.insurancePolicyScans);
				axios.post(`${process.env.REACT_APP_URL}/api/trips/${respForm.data.id}/documents`,
					form, config
				);

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

	changeTourismKind(value) {
		this.setState((prev) => {
			return {
				...prev,
				tourismKind: value
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

	close = () => {
		this.setState(() => ({ buttonIsPressed: false }))
		window.location.href = '/';
	}

	open = () => {
		this.setState(() => ({ buttonIsPressed: true }))
	}

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
			<Grid item lg={5} md={12} sm={12} xs={12}>
				<label >{fileName}</label><br />
				<Gapped>
					<Button style={{ width: "407px" }} onClick={() => { ref.current.click() }}>Загрузить</Button>
					<Tooltip render={toolTipMethod} pos="right top">
						<HelpDotIcon />
					</Tooltip>
				</Gapped>
				<input type="file" style={{ display: "none" }} name={name} ref={ref} onChange={this.onFileChange} multiple />
			</Grid>
		)
	}

	render() {
		const getItems = query =>
			Promise.resolve(
				GLOBALAREA.map(item => { return { value: item, label: item } })
					.filter(item => item.value.toLowerCase().startsWith(query.toLowerCase()))
			);
		const { buttonIsPressed } = this.state;
		const tourismVariants = ["Пеший", "Лыжный", "Водный", "Горный", "Пеше-водный",
			"Спелео", "Велотуризм", "Парусный", "Конный", "Авто-мото"];
		return (
			<div>
				<Center>
					<form onSubmit={this.onSubmit}>
						<Box sx={{ flexGrow: 1 }}>
							<Grid container spacing={2.5} justifyContent="end">
								{this.renderInput("Название спортивной организации", "text", "formInputField",
									"groupName", "groupName", this.state.groupName, this.changeInputRegister, "Команда Иванова")}
								{this.renderInput("ФИО координатора", "text", "formInputField",
									"coordinatorName", "coordinatorName", this.state.coordinatorName, this.changeInputRegister, "Иванов Иван Иванович")}
								<Grid item xs={5}>
									<label htmlFor="generalArea">Общий район</label><br />
									<ComboBox style={{ border: "0.4px solid" }} drawArrow={true} size="medium" width={407} getItems={getItems}
										value={{ value: this.state.generalArea, label: this.state.generalArea }}
										onValueChange={this.changeComboBox} name="generalArea" />
								</Grid>
								{this.renderInput("Контактный телефон координатора", "text", "formInputField",
									"coordinatorPhoneNumber", "coordinatorPhoneNumber", this.state.coordinatorPhoneNumber,
									this.changeInputRegister, "+7(999)-111-22-33")}
								{this.renderInput("Локальный район", "text", "formInputField",
									"localArea", "localArea", this.state.localArea,
									this.changeInputRegister, "хребет Катунские Белки")}
								{this.renderInput("Населенный пункт начала маршрута район", "text", "formInputField",
									"controlStartRegion", "controlStartRegion", this.state.controlStartRegion,
									this.changeInputRegister, "деревня Хлопинки")}
								{this.renderInput("Категория сложность", "text", "formInputField",
									"routeDifficulty", "routeDifficulty", this.state.routeDifficulty,
									this.changeInputRegister, "1-4")}
								{this.renderInput("Контрольный срок сообщения о начале маршрута", "date", "formInputField",
									"controlStartDate", "controlStartDate", this.state.controlStartDate,
									this.changeInputRegister, "")}
								<Grid item xs={5}>
									<label htmlFor="tourismKind">Вид туризма</label><br />
									<Select size="medium" width={407} items={tourismVariants}
										value={this.state.tourismKind}
										onValueChange={this.changeTourismKind} required={true}/>
								</Grid>
								{this.renderInput("Населенный пункт окончания маршрута", "text", "formInputField",
									"controlEndRegion", "controlEndRegion", this.state.controlEndRegion,
									this.changeInputRegister, "деревня Икниплох")}
								{this.renderInput("Дата выхода на маршрут", "date", "formInputField",
									"routeStartDate", "routeStartDate", this.state.routeStartDate,
									this.changeInputRegister, "")}
								{this.renderInput("Контрольный срок сообщения об окончании маршрута", "date", "formInputField",
									"controlEndDate", "controlEndDate", this.state.controlEndDate,
									this.changeInputRegister, "")}
								{this.renderInput("Дата окончания маршрута", "date", "formInputField",
									"routeEndDate", "routeEndDate", this.state.routeEndDate,
									this.changeInputRegister, "")}
								{this.renderFileUpload("Маршрутная книжка", "routeBook", this.hiddenFileInputRoute, this.ToolTipForRouteBook)}
								{this.renderInput("Количество человек", "text", "formInputField",
									"participantsNumber", "participantsNumber", this.state.participantsNumber,
									this.changeInputRegister, "")}
								{this.renderFileUpload("Картографический материал",
									"cartographicMaterial", this.hiddenFileInputCartographic, this.ToolTipForCartographic)}
								{this.renderInput("Наименование страховой компании", "text", "formInputField",
									"insuranceCompanyName", "insuranceCompanyName", this.state.insuranceCompanyName,
									this.changeInputRegister, "ЕМККСтрахование")}
								{this.renderFileUpload("Справки участников", "participantsReferences",
									this.hiddenFileInputParticipants, this.ToolTipForReferences)}
								{this.renderInput("Срок действия страховых полисов", "date", "formInputField",
									"insurancePolicyValidityDuration", "insurancePolicyValidityDuration", this.state.insurancePolicyValidityDuration,
									this.changeInputRegister, "")}
								{this.renderFileUpload("Сканы страховых полисов", "insurancePolicyScans",
									this.hiddenFileInputInsurance, this.ToolTipForInsuranceScans)}
								<Grid item xs={6}>
									<div>
									</div>
								</Grid>
								<Grid item xs={2}>
									<Button type="submit">Подать заявку</Button>
								</Grid>
							</Grid>
						</Box>
					</form>
					{buttonIsPressed && <ShowModal close={this.close} />}
				</Center>
			</div>
		)
	}

}