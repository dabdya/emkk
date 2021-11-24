import React from 'react';
import { GLOBALAREA, KINDOFTOURISM } from '../utils/Constants';
import { Autocomplete, TextField, Button } from '@mui/material'
import { getToken } from '../utils/Common';
import Requests from '../utils/requests'
import ShowModal from "./ShowModal"


export default class ApplicationForm extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			group_name: "",
			global_region: "",
			local_region: "",
			start_date: new Date(),
			end_date: new Date(),
			control_start_date: new Date(),
			control_end_date: new Date(),
			control_start_region: "",
			control_end_region: "",
			routeBook: 0,
			cartographicMaterial: 0,
			participantsReferences: 0,
			insurancePolicyScans: 0,
			difficulty_category: 1,
			participants_count: 1,
			kind: null,
			coordinator_name: "",
			coordinator_phone_number: "",
			insurance_company_name: "",
			insurance_policy_validity_duration: new Date(),
			buttonIsPressed: false,
			files: []
		};

		this.open = this.open.bind(this);
		this.close = this.close.bind(this);
		this.uploadFile = this.uploadFile.bind(this);
		this.changeInputRegister = this.changeInputRegister.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.handleTag = this.handleTag.bind(this);
	}


	async onSubmit(event) {
		event.preventDefault()
		const { files, buttonIsPressed, ...rest } = this.state;
		const config = {
			headers: {
				Authorization: 'Token ' + getToken()
			}
		};
		const request = new Requests();
		await request.post(`${process.env.REACT_APP_URL}/api/trips`,
			rest,
			config).then(respForm => {
				this.setState({
					buttonIsPressed: true
				});

				const form = new FormData()
				for (const file of this.state.files) {
					form.append("file", file);
				}
				request.post(`${process.env.REACT_APP_URL}/api/trips/${respForm.data.id}/documents`,
					form, config
				);
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

	handleTag({ target }, fieldName) {
		const { value } = target;
		if (fieldName == "kind") {
			this.setState({ [fieldName]: KINDOFTOURISM[value] });

		} else {
			this.setState({ [fieldName]: value });
		}
	};

	close() {
		this.setState(() => ({ buttonIsPressed: false }))
		window.location.href = '/';
	}

	uploadFile(event) {
		const filesArr = Array.prototype.slice.call(event.target.files);
		this.setState({ files: [...this.state.files, ...filesArr] });
	}


	open() {
		this.setState(() => ({ buttonIsPressed: true }))
	}

	render() {
		const tourismVariants = ["Пеший", "Лыжный", "Водный", "Горный", "Пеше-водный",
			"Спелео", "Велотуризм", "Парусный", "Конный", "Авто-мото"];
		return (
			<form className="application" onSubmit={this.onSubmit} style={{
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
						style={{ width: '100%' }}
						InputProps={{ inputProps: { tabIndex: 1 } }}
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
						style={{ width: '100%' }}
						InputProps={{ inputProps: { tabIndex: 11 } }}
						variant="filled"
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<Autocomplete
						openOnFocus
						id="combo-box-demo"
						options={GLOBALAREA}
						style={{ width: '100%' }}
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
						style={{ width: '100%' }}
						variant="filled"
						InputProps={{ inputProps: { tabIndex: 12 } }}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						label="Локальный район"
						name="local_region"
						style={{ width: '100%' }}
						InputProps={{ inputProps: { tabIndex: 3 } }}
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
						style={{ width: '100%' }}
						variant="filled"
						InputProps={{ inputProps: { tabIndex: 13 } }}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<Autocomplete
						openOnFocus
						id="combo-box-demo"
						options={["1", "2", "3", "4", "5", "6"]}
						onSelect={(event) => this.handleTag(event, "difficulty_category")}
						style={{ width: '100%' }}
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
						style={{ width: '100%' }}
						InputProps={{ tabIndex: 14 }}
						InputLabelProps={{
							shrink: true
						}}
						variant="filled"
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<Autocomplete
						openOnFocus
						id="kind"
						options={tourismVariants}
						style={{ width: '100%' }}
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
						style={{ width: '100%' }}
						InputProps={{ tabIndex: 15 }}
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
						style={{ width: '100%' }}
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
						style={{ width: '100%' }}
						InputProps={{ tabIndex: 16 }}
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
						style={{ width: '100%' }}
						InputProps={{ inputProps: { tabIndex: 7 } }}
						InputLabelProps={{
							shrink: true
						}}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<label className="custom-file-upload">
						<input type="file" multiple
							onChange={(event) => {
								this.uploadFile(event);
								this.setState({ routeBook: this.state.routeBook + event.target.files.length })
							}}
							style={{ display: "none" }} />
						Загрузить маршрутную книжку
					</label>
					{this.state.routeBook >= 1 && `Загружен(о) ${this.state.routeBook} файл/а/ов`}
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						name="participants_count"
						label="Количество участников"
						variant="filled"
						style={{ width: '100%' }}
						InputProps={{ inputProps: { tabIndex: 8, pattern: "[0-9]+" } }}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<label className="custom-file-upload">
						<input type="file" multiple
							onChange={(event) => {
								this.uploadFile(event);
								this.setState({ cartographicMaterial: this.state.cartographicMaterial + event.target.files.length })
							}}
							style={{ display: "none" }} />
						Загрузить Картографический материал
					</label>
					{this.state.cartographicMaterial >= 1 && `Загружен(о) ${this.state.cartographicMaterial} файл/а/ов`}
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						label="Наименование страховой компании"
						name="insurance_company_name"
						variant="filled"
						style={{ width: '100%' }}
						InputProps={{ inputProps: { tabIndex: 9 } }}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<label className="custom-file-upload">
						<input type="file" multiple
							onChange={(event) => {
								this.uploadFile(event);
								this.setState({ participantsReferences: this.state.participantsReferences + event.target.files.length })
							}}
							style={{ display: "none" }} />
						Загрузить справки участников
					</label>
					{this.state.participantsReferences >= 1 && `Загружен(о) ${this.state.participantsReferences} файл/а/ов`}
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						label="Срок окончания страховых полисов"
						name="insurance_policy_validity_duration"
						type="date"
						variant="filled"
						style={{ width: '100%' }}
						InputProps={{ inputProps: { tabIndex: 10 } }}
						InputLabelProps={{
							shrink: true
						}}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<label className="custom-file-upload" >
						<input type="file" multiple
							onChange={(event) => {
								this.uploadFile(event);
								this.setState({ insurancePolicyScans: this.state.insurancePolicyScans + event.target.files.length })
							}}
							style={{ display: "none" }} />
						Загрузить сканы страховых полисов
					</label>
					{this.state.insurancePolicyScans >= 1 && `Загружен(о) ${this.state.insurancePolicyScans} файл/а/ов`}
				</div>
				<div className="cell"> </div>
				<div className="cell">
					<Button variant="contained"
						type="submit"
						style={{ width: "80%", backgroundColor: "#136DAB" }}
					>Отправить заявку</Button>
				</div>
				{this.state.buttonIsPressed && <ShowModal close={this.close} />}
			</form >
		)
	}

}