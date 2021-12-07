import React from 'react';
import { withRouter } from 'react-router-dom';
import ShowModal from "./ShowModal"
import { GLOBAL_AREA, KIND_OF_TOURISM } from '../utils/Constants';
import { getToken } from '../utils/Common';
import Requests from '../utils/requests'
import HelpIcon from '@mui/icons-material/Help';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { Autocomplete, TextField, Button } from '@mui/material'


class ApplicationForm extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			buttonIsPressed: false,
			routeBookCount: 0,
			cartographicMaterialCount: 0,
			participantsReferencesCount: 0,
			insurancePolicyScansCount: 0,
		};
		this.app = {
			group_name: "",
			global_region: "",
			local_region: "",
			start_date: null,
			end_date: null,
			control_start_date: null,
			control_end_date: null,
			control_start_region: "",
			control_end_region: "",
			difficulty_category: 0,
			participants_count: 0,
			kind: null,
			coordinator_name: "",
			coordinator_phone_number: "",
			insurance_company_name: "",
			insurance_number: "",
			insurance_policy_validity_duration: null,
			files: [],
		}


		this.open = this.open.bind(this);
		this.close = this.close.bind(this);
		this.uploadFile = this.uploadFile.bind(this);
		this.changeInputRegister = this.changeInputRegister.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.handleTag = this.handleTag.bind(this);
	}


	async onSubmit(event) {
		event.preventDefault()
		const { files, ...rest } = this.app;
		const config = {
			headers: {
				Authorization: 'Token ' + getToken()
			}
		};
		const request = new Requests();
		await request.post(`${process.env.REACT_APP_URL}/api/trips`,
			rest,
			config).then(respForm => {
				this.open();

				const form = new FormData()
				for (const file of this.app.files) {
					form.append("file", file);
				}
				request.post(`${process.env.REACT_APP_URL}/api/trips/${respForm.data.id}/documents`,
					form, config
				);
			})
	}

	changeInputRegister(event) {
		event.persist();

		this.app[event.target.name] = event.target.value;
	};

	handleTag({ target }, fieldName) {
		const { value } = target;
		if (fieldName === "kind") {
			this.app[fieldName] = KIND_OF_TOURISM[value];
		} else {
			this.app[fieldName] = value;
		}
	};

	close() {
		this.setState(() => ({ buttonIsPressed: false }))
		window.location.href = '/';
	}

	uploadFile(event) {
		const filesArr = Array.prototype.slice.call(event.target.files);
		this.app.files = [...this.app.files, ...filesArr]
	}

	open() {
		this.setState(() => ({ buttonIsPressed: true }))
	}

	render() {
		const tourismVariants = ["Пеший", "Лыжный", "Водный", "Горный", "Пеше-водный",
			"Спелео", "Велотуризм", "Парусный", "Конный", "Авто-мото"];
		const styleTextField = { width: "100%" };
		return (
			<form className="application"
				onSubmit={this.onSubmit}
				style={{
					display: "grid",
					gridTemplateColumns: "auto auto",
					gridColumnGap: "5px",
					gridRowGap: "10px",
					margin: "10px 10px 10px 10px"
				}}>
				<div className="cell">
					<TextField
						required
						id="outlined"
						name="group_name"
						label="Название спортивной организации"
						style={styleTextField}
						InputProps={{ inputProps: { tabIndex: 1, autoComplete: "off" } }}
						variant="filled"
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						name="coordinator_name"
						label="ФИО координатора"
						style={styleTextField}
						InputProps={{ inputProps: { tabIndex: 12, autoComplete: "off" } }}
						variant="filled"
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<Autocomplete
						openOnFocus
						id="combo-box-demo"
						options={GLOBAL_AREA}
						style={styleTextField}
						onSelect={(event) => this.handleTag(event, "global_region")}
						renderInput={(params) =>
							<TextField {...params}
								variant="filled"
								inputProps={{ ...params.inputProps, tabIndex: 2, required: true }}
								label="Общий район"
								required />}
					/>
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						type="tel"
						name="coordinator_phone_number"
						label="Контактный телефон координатора"
						placeholder="+7(999)99999999"
						style={styleTextField}
						variant="filled"
						//eslint-disable-next-line
						InputProps={{ inputProps: { tabIndex: 13, pattern: "\+?[0-9\s\-\(\)]+", autoComplete: "off" } }}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						label="Локальный район"
						name="local_region"
						style={styleTextField}
						InputProps={{ inputProps: { tabIndex: 3, autoComplete: "off" } }}
						variant="filled"
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						name="control_start_region"
						label="Населённый пункт начала маршрута"
						style={styleTextField}
						variant="filled"
						InputProps={{ inputProps: { tabIndex: 14, autoComplete: "off" } }}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<Autocomplete
						openOnFocus
						id="combo-box-demo"
						options={["1", "2", "3", "4", "5", "6"]}
						onSelect={(event) => this.handleTag(event, "difficulty_category")}
						style={styleTextField}
						renderInput={(params) =>
							<TextField {...params}
								variant="filled"
								inputProps={{ ...params.inputProps, required: true, tabIndex: 4 }}
								label="Категория сложности" required />}
					/>
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						label="Контрольный срок сообщения о начале маршрута"
						name="control_start_date"
						type="date"
						style={styleTextField}
						InputProps={{ inputProps: { tabIndex: 15 } }}
						InputLabelProps={{ shrink: true }}
						variant="filled"
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<Autocomplete
						openOnFocus
						id="kind"
						options={tourismVariants}
						style={styleTextField}
						onSelect={(event) => this.handleTag(event, "kind")}
						renderInput={(params) =>
							<TextField {...params}
								variant="filled"
								inputProps={{ ...params.inputProps, tabIndex: 5 }}
								label="Вид туризма"
								required />}

					/>
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						label="Населённый пункт окончания маршрута"
						name="control_end_region"
						style={styleTextField}
						InputProps={{ inputProps: { tabIndex: 16, autoComplete: "off" } }}
						variant="filled"
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						label="Дата выхода на маршрут"
						name="start_date"
						type="date"
						style={styleTextField}
						variant="filled"
						InputProps={{ inputProps: { tabIndex: 6 } }}
						InputLabelProps={{ shrink: true }}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						label="Контрольный срок сообщения об окончании маршрута"
						name="control_end_date"
						type="date"
						variant="filled"
						style={styleTextField}
						InputProps={{ inputProps: { tabIndex: 17 } }}
						InputLabelProps={{ shrink: true }}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						label="Дата выхода с маршрута"
						name="end_date"
						type="date"
						variant="filled"
						style={styleTextField}
						InputProps={{ inputProps: { tabIndex: 7 }, autoComplete: "off" }}
						InputLabelProps={{
							shrink: true
						}}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<div className="cell-file">
						<label className="custom-file-upload">
							<input type="file" multiple
								onChange={(event) => {
									this.uploadFile(event);
									this.setState({ routeBookCount: this.state.routeBookCount + event.target.files.length })
								}}
								style={{ display: "none" }} />
							Загрузить маршрутную книжку
						</label>
						<Tooltip
							placement="top-start"
							tabIndex={18}
							title="Формат имени файла:
							ГОД_МЕСЯЦ_ФИОруководителя_Район_категория. документ в формате pdf, doc/docx, xls/xlsx">
							<IconButton>
								<HelpIcon />
							</IconButton>
						</Tooltip>
					</div>
					{this.state.routeBookCount >= 1 && `Загружен(о) ${this.state.routeBookCount} файл/а/ов`}
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						name="participants_count"
						label="Количество участников"
						variant="filled"
						style={styleTextField}
						InputProps={{ inputProps: { tabIndex: 8, pattern: "[0-9]+", autoComplete: "off" } }}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<div className="cell-file">
						<label className="custom-file-upload">
							<input type="file" multiple
								onChange={(event) => {
									this.uploadFile(event);
									this.setState({ cartographicMaterialCount: this.state.cartographicMaterialCount + event.target.files.length })
								}}
								style={{ display: "none" }} />
							Загрузить картографический материал
						</label>
						<Tooltip
							placement="top-start"
							tabIndex={19}
							title="Формат имени файла:
							ГОД_МЕСЯЦ_ФИОруководителя_Район_категория_карта">
							<IconButton>
								<HelpIcon />
							</IconButton>
						</Tooltip>
					</div>
					{this.state.cartographicMaterialCount >= 1 && `Загружен(о) ${this.state.cartographicMaterialCount} файл/а/ов`}
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						label="Наименование страховой компании"
						name="insurance_company_name"
						variant="filled"
						style={styleTextField}
						InputProps={{ inputProps: { tabIndex: 9, autoComplete: "off" } }}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<div className="cell-file">
						<label className="custom-file-upload">
							<input type="file" multiple
								onChange={(event) => {
									this.uploadFile(event);
									this.setState({ participantsReferencesCount: this.state.participantsReferencesCount + event.target.files.length })
								}}
								style={{ display: "none" }} />
							Загрузить справки участников
						</label>
						<Tooltip
							placement="top-start"
							tabIndex={20}
							title="Какие-то справки">
							<IconButton>
								<HelpIcon />
							</IconButton>
						</Tooltip>
					</div>
					{this.state.participantsReferencesCount >= 1 && `Загружен(о) ${this.state.participantsReferencesCount} файл/а/ов`}
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						label="Номер полиса"
						name="insurance_number"
						variant="filled"
						style={styleTextField}
						InputProps={{ inputProps: { tabIndex: 10, autoComplete: "off" } }}
						onChange={this.changeInputRegister}
					/>
				</div>

				<div className="cell">
					<div className="cell-file">
						<label className="custom-file-upload" >
							<input type="file" multiple
								onChange={(event) => {
									this.uploadFile(event);
									this.setState({ insurancePolicyScansCount: this.state.insurancePolicyScansCount + event.target.files.length })
								}}
								style={{ display: "none" }} />
							Загрузить сканы страховых полисов
						</label>
						<Tooltip
							placement="top-start"
							tabIndex={20}
							title="Формат имени файла:
							ГОД_МЕСЯЦ_ФИОруководителя_Район_категория_полисы">
							<IconButton>
								<HelpIcon />
							</IconButton>
						</Tooltip>
					</div>
					{this.state.insurancePolicyScansCount >= 1 && `Загружен(о) ${this.state.insurancePolicyScansCount} файл/а/ов`}
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						label="Срок окончания страховых полисов"
						name="insurance_policy_validity_duration"
						type="date"
						variant="filled"
						style={styleTextField}
						InputProps={{ inputProps: { tabIndex: 11 } }}
						InputLabelProps={{
							shrink: true
						}}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<Button variant="contained"
						type="submit"
						tabIndex={21}
						style={{ width: "80%", backgroundColor: "#136DAB" }}
					>Отправить заявку</Button>
				</div>
				{this.state.buttonIsPressed && <ShowModal close={this.close} message="Заявка подана!" />}
			</form >
		)
	}
}

export default withRouter(ApplicationForm);