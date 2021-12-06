import React from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Select, ComboBox } from '@skbkontur/react-ui'
import { Grid, Autocomplete, TextField } from '@mui/material'
import ReviewContent from './ReviewContent';
import { KIND_OF_TOURISM, GLOBAL_AREA, STATUS } from '../utils/Constants';
import Requests from '../utils/requests';
import { getToken, getUser } from '../utils/Common';
import icon from "../images/delete.ico";


class Application extends React.Component {

	requests = new Requests();
	constructor(props) {
		super(props);
		this.state = {
			isEditing: false,
			files: [],
			reviews: [],
			issues: [],
			status: "",
		};

		this.app = {
			id: 0,
			group_name: "",
			leader: "",
			global_region: "",
			local_region: "",
			participants_count: "",
			difficulty_category: "",
			kind: "",
			start_date: "",
			end_date: "",
			coordinator: "",
			control_end_date: "",
			control_end_region: "",
			control_start_date: "",
			control_start_region: "",
			insurance_company_name: "",
			insurance_policy_validity_duration: "",
			last_modified_at: "",
			status: "",
		}

		this.review = {
			result_comment: "",
			result: "",
		}

		this.issue = {
			result_comment_issue: "",
			result_issue: "",
		}

		this.roles = this.props.location.state.roles;
		this.changeEditing = this.changeEditing.bind(this);
		this.changeTourismKind = this.changeTourismKind.bind(this);
		this.changeComboBox = this.changeComboBox.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.createBlob = this.createBlob.bind(this);
		this.deleteDocument = this.deleteDocument.bind(this);
		this.addDocument = this.addDocument.bind(this);
		this.config = this.config.bind(this);
		this.takeOnReview = this.takeOnReview.bind(this);
		this.writeReview = this.writeReview.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.uploadReview = this.uploadReview.bind(this);
		this.writeIssue = this.writeIssue.bind(this);
	}

	config() {
		return {
			headers: {
				Authorization: 'Token ' + getToken()
			}
		}
	};


	async componentDidMount() {
		await this.requests.get(`${process.env.REACT_APP_URL}/api/trips/${this.props.location.state.id}`, this.config())
			.then(response => {
				this.app = {
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
					coordinator: response.data.coordinator_name + " " + response.data.coordinator_phone_number,
					control_end_date: response.data.control_end_date,
					control_end_region: response.data.control_end_region,
					control_start_date: response.data.control_start_date,
					control_start_region: response.data.control_start_region,
					insurance_company_name: response.data.insurance_company_name,
					insurance_policy_validity_duration: response.data.insurance_policy_validity_duration,
					last_modified_at: response.data.last_modified_at
				}
				this.setState({ status: response.data.status });
			})
			.catch(err => console.error(err));

		await this.requests.get(`${process.env.REACT_APP_URL}/api/trips/${this.props.location.state.id}/documents`, this.config())
			.then(async resp => {
				resp.data.forEach(file => {
					this.setState(prevState => ({
						files: [...prevState.files, { uuid: file.uuid, filename: file.filename }]
					}))
				});
			});

		await this.requests.get(`${process.env.REACT_APP_URL}/api/trips/${this.props.location.state.id}/reviews`, this.config())
			.then(resp => {
				this.setState({ reviews: resp.data });
			})
			.catch(err => console.error(err));

		await this.requests.get(`${process.env.REACT_APP_URL}/api/trips/${this.props.location.state.id}/reviews-from-issuer`, this.config())
			.then(resp => {
				this.setState({ issues: resp.data });
			})
			.catch(err => console.error(err));
	};

	async takeOnReview() {
		await this.requests.post(`${process.env.REACT_APP_URL}/api/trips/work`, { trip: this.state.id }, this.config())
			.then(resp => {
				console.log(resp);
			});
	}

	async uploadReview(e) {
		const file = e.target.files[0];
		await this.requests.post(`${process.env.REACT_APP_URL}/api/trips/${this.state.id}/reviews`,
			{ result: STATUS[this.state.result], result_comment: STATUS[this.state.result] },
			this.config())
			.then(resp => {
				const form = new FormData()
				form.append("file", file);
				this.requests.post(`${process.env.REACT_APP_URL}/api/trips/${this.state.id}/reviews/${resp.data.id}/documents`,
					form,
					this.config())
			});
		await this.requests.get(`${process.env.REACT_APP_URL}/api/trips/${this.props.location.state.id}/reviews`, this.config())
			.then(resp => {
				this.setState({ reviews: resp.data });
			})
			.catch(err => console.error(err));
	}

	async writeReview(e) {
		e.preventDefault()
		await this.requests.post(`${process.env.REACT_APP_URL}/api/trips/${this.app.id}/reviews`,
			{ result: STATUS[this.review.result], result_comment: this.review.result_comment },
			this.config())
			.then(resp => {
				this.setState({ status: resp.data.trip.status });
				this.setState(prevState => ({
					reviews:
						[...prevState.reviews,
						{
							id: resp.data.id,
							result: resp.data.result,
							result_comment: resp.data.result_comment,
							reviewer: resp.data.reviewer,
						}]
				}));

			});
	}

	writeIssue(e) {
		e.preventDefault()
		this.requests.post(`${process.env.REACT_APP_URL}/api/trips/${this.app.id}/reviews-from-issuer`,
			{ result: STATUS[this.issue.result_issue], result_comment: this.issue.result_comment_issue },
			this.config())
			.then(resp => {
				// this.setState(prevState => ({ issues: [...prevState.issues, resp.data.review] }));

			});
	}


	handleChange(e) {
		this.app[e.target.name] = e.target.value;
	};

	changeTourismKind(value) {
		this.app.kind = KIND_OF_TOURISM[value];
	};

	async createBlob(e, file) {
		e.preventDefault()
		let mime;
		const resp = await this.requests.get(`${process.env.REACT_APP_URL}/api/documents/${file.uuid}`, { ...this.config(), responseType: 'arraybuffer' })
			.then(resp => {
				mime = resp.headers["content-type"];
				return resp;
			})
		const blob = new Blob([resp.data], { type: mime });
		let a = document.createElement("a")
		a.download = file.filename;
		a.href = URL.createObjectURL(blob);
		a.click();
	};

	changeComboBox(event) {
		this.app.global_region = event.value;
	};

	async onSubmit(event) {
		event.preventDefault();
		const { id, isEditing, files, reviews, ...data } = this.app;
		await this.requests.patch(`${process.env.REACT_APP_URL}/api/trips/${id}`, data, this.config())
			.then(resp => {
				this.app.last_modified_at = resp.data.last_modified_at;
				this.changeEditing();
			})
	}

	changeEditing() {
		this.setState({ isEditing: !this.state.isEditing })
	}

	async deleteDocument(file) {
		await this.requests.delete(`${process.env.REACT_APP_URL}/api/documents/${file.uuid}`,
			this.config())
			.then(() => {
				this.setState(prevState => ({ files: prevState.files.filter(item => item.uuid !== file.uuid) }));
			})
	}

	async addDocument(afile) {
		const files = afile.target.files;

		const form = new FormData()
		for (const file of files) {
			form.append("file", file);
		}

		await this.requests.post(`${process.env.REACT_APP_URL}/api/trips/${this.props.location.state.id}/documents`, form,
			this.config())
			.then(resp => {
				for (const item of resp.data) {
					this.setState(prevState => ({ files: [...prevState.files, { uuid: item.uuid, filename: item.filename }] }));
				}
			})
	}

	render() {
		const { isEditing } = this.state;
		const tourismVariants = ["Пеший", "Лыжный", "Водный", "Горный", "Пеше-водный",
			"Спелео", "Велотуризм", "Парусный", "Конный", "Авто-мото"];
		const getItems = query =>
			Promise.resolve(
				GLOBAL_AREA.map(item => { return { value: item, label: item } })
					.filter(item => item.value.toLowerCase().startsWith(query.toLowerCase()))
			);

		return (
			<div>
				<form onSubmit={this.onSubmit}>
					<div style={{ display: "inline-block", marginLeft: 15 }}>
						<h1 style={{ marginLeft: 20, fontSize: 40, color: "#4A4A4A", fontWeight: "normal", display: "inline-block" }}>Заявка №{this.app.id}</h1>
						{!isEditing && getUser() === this.app.leader?.username && < Button onClick={this.changeEditing} style={{ marginLeft: 20 }}>Редактировать заявку</Button>}
						{isEditing && <Button type="submit" style={{ marginLeft: 20 }} >Сохранить</Button>}
						{<span style={{ marginLeft: 10 }}>Последнее изменение: {new Date(this.app.last_modified_at).toLocaleString()}</span>}
					</div>
					<div style={{
						display: "grid",
						gridTemplateColumns: "auto auto",
						gridColumnGap: "0px",
						gridRowGap: "10px",
						marginLeft: "40px"
					}}>
						<div className="cell-app"><div>ФИО руководителя:</div><div>{`${this.app.leader.first_name} ${this.app.leader.last_name} ${this.app.leader.patronymic}`}</div></div>
						<div className="cell-app"><div>Спортивная организация:</div><div>{isEditing ? <input defaultValue={this.app.group_name} onChange={e => this.app.group_name = e.target.value} /> : this.app.group_name}</div></div>
						<div className="cell-app"><div>Дата начала маршрута:</div><div>{isEditing ? <input type="date" defaultValue={this.app.start_date} onChange={e => this.app.start_date = e.target.value} /> : this.app.start_date}</div></div>
						<div className="cell-app"><div>Страховая компания:</div><div>{isEditing ? <input type="text" defaultValue={this.app.insurance_company_name} onChange={e => this.app.insurance_company_name = e.target.value} /> : this.app.insurance_company_name}</div></div>
						<div className="cell-app"><div>Дата окончания маршрута:</div><div>{isEditing ? <input type="date" defaultValue={this.app.end_date} onChange={e => this.app.end_date = e.target.value} /> : this.app.end_date}</div></div>
						<div className="cell-app"><div>Срок действия полиса:</div><div>{isEditing ? <input type="date" defaultValue={this.app.insurance_policy_validity_duration} onChange={e => this.app.insurance_policy_validity_duration = e.target.value} /> : this.app.insurance_policy_validity_duration}</div></div>
						<div className="cell-app"><div>Район:</div><div>{isEditing ?
							<>
								<ComboBox drawArrow={true}
									getItems={getItems}
									value={{ value: this.app.global_region, label: this.app.global_region }}
									onValueChange={this.changeComboBox}
									name="generalArea"
								/>
								<input defaultValue={this.app.local_region}
									onChange={e => this.app.local_region = e.target.value}
								/>
							</> : `${this.app.global_region}, ${this.app.local_region}`}</div></div>
						<div className="cell-app"><div>Число участников:</div><div>{isEditing ? <input type="text" pattern="^[0-9]+$" defaultValue={this.app.participants_count} onChange={e => this.setState({ participants_count: e.target.value })} /> : this.app.participants_count}</div></div>
						<div className="cell-app"><div>Вид туризма:</div><div>{isEditing ? <Select items={tourismVariants} value={KIND_OF_TOURISM[this.app.kind]} onValueChange={this.changeTourismKind} required /> : KIND_OF_TOURISM[this.app.kind]}</div></div>
						<div className="cell-app"><div>Категория сложности:</div><div>{isEditing ? <input type="text" pattern="[1-6]" defaultValue={this.app.difficulty_category} onChange={e => this.app.difficulty_category = e.target.value} /> : this.app.difficulty_category}</div></div>
						<div className="cell-app"><div>Контрольный сроки начала:</div><div>{isEditing ?
							<>
								<input defaultValue={this.app.control_start_region}
									onChange={e => this.app.control_start_region = e.target.value}
								/>
								<input defaultValue={this.app.control_start_date}
									type="date"
									onChange={e => this.app.control_start_date = e.target.value}
								/>
							</> : `${this.app.control_start_region}, ${this.app.control_start_date}`}</div></div>
						<div className="cell-app"><div>Координатор-связной:</div><div>{isEditing ? <input defaultValue={this.app.coordinator} onChange={e => this.app.coordinator = e.target.value} /> : this.app.coordinator}</div></div>
						<div className="cell-app"><div>Контрольные сроки конца:</div><div>{isEditing ?
							<>
								<input defaultValue={this.app.control_end_region}

									onChange={e => this.app.control_end_region = e.target.value}
								/>
								<input defaultValue={this.app.control_end_date}
									type="date"
									onChange={e => this.app.control_end_date = e.target.value}
								/>
							</> : `${this.app.control_end_region}, ${this.app.control_end_date}`}</div></div>
					</div>
				</form>
				<div style={{ marginTop: 30, marginLeft: 25, marginRight: 50 }}>
					<hr />
				</div>

				<div style={{ marginTop: 15, marginLeft: 40, height: "fit-content" }}>
					<h1 style={{
						marginBlockEnd: 20,
						fontSize: 20, color: "#4A4A4A",
						fontWeight: "normal",
						textDecoration: "underline",
						textDecorationColor: "#1D85D0",
						textUnderlineOffset: "0.5rem"
					}}>Документы</h1>
					<div>
						<Grid container rowSpacing={1} columnSpacing={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
							{
								this.state.files.map(file => {
									return (<Grid item xs={12} sm={12} md={12} lg={12}>
										{/*eslint-disable-next-line */}
										<a onClick={(e) => this.createBlob(e, file)} href="#" target="_blank" style={{ textDecoration: "none", color: "#4C94FF" }}>{file.filename}</a>
										<img src={icon} onClick={() => this.deleteDocument(file)} alt="delete" className="deleteIcon" />
									</Grid>
									);
								})
							}
						</Grid>
						<div style={{ marginTop: 15 }}>
							<input
								ref="fileInput"
								onChange={this.addDocument}
								type="file"
								style={{ display: "none" }}
								multiple={true}
							/>
							{getUser() === this.app.leader.username && <Button onClick={() => this.refs.fileInput.click()}>Добавить документы</Button>}
						</div>
					</div>
				</div>
				<div style={{ marginLeft: 25, marginRight: 50 }}>
					<hr />
				</div>
				<div style={{ marginTop: 15, marginLeft: 40, height: "fit-content" }}>
					Рецензии ({this.state.reviews.length}/2)
					{this.state.reviews.map(review =>
						<ReviewContent result={review.result} comment={review.result_comment}
							reviewer={review.reviewer} key={review.id} />
					)}
				</div>
				{
					this.props.location.state.isMyReview &&
					this.state.status !== "at_issuer" &&
					<>
						<form onSubmit={this.writeReview}>
							<Autocomplete
								openOnFocus
								options={["Отклонить", "Принять", "На доработку"]}
								onSelect={(event) => this.review.result = event.target.value}
								renderInput={(params) =>
									<TextField {...params}
										variant="filled"
										name="result"
										inputProps={{ ...params.inputProps }}
										label="Статус"
										required />}

							/>
							<TextField
								style={{ width: "100%" }}
								name="result_comment"
								placeholder="Рецензия"
								multiline
								rows={7}
								rowsMax={Infinity}
								onChange={(event) => this.review.result_comment = event.target.value}
								required
							/>
							<button type="submit">Отправить</button>
						</form>
						<div className="cell-file">
							<label className="custom-file-upload" style={{ backgroundColor: "#136DAB", color: "white" }} >
								<input type="file"
									onChange={(event) => {
										this.uploadReview(event);
									}}
									style={{ display: "none" }} />
								Отправить рецензию файлом со статусом {this.state.result}
							</label>

						</div>
					</>
				}
				<div style={{ marginTop: 15, marginLeft: 40, height: "fit-content" }}>
					Выпуски
					{this.state.issues.map(issue =>
						<ReviewContent result={issue.result} comment={issue.result_comment}
							reviewer={issue.reviewer} key={issue.id} />
					)}
				</div>
				{
					this.roles.issuer &&
					this.state.status === "at_issuer" &&
					!this.state.issues[0] &&
					<>
						<form onSubmit={this.writeIssue}>
							<Autocomplete
								openOnFocus
								options={["Отклонить", "Принять", "На доработку"]}
								onSelect={(event) => this.issue.result_issue = event.target.value}
								renderInput={(params) =>
									<TextField {...params}
										variant="filled"
										name="result_issue"
										inputProps={{ ...params.inputProps }}
										label="Статус"
										required />}

							/>
							<TextField
								style={{ width: "100%" }}
								name="result_comment_issue"
								placeholder="Выпуск"
								multiline
								rows={7}
								rowsMax="Infinity"
								onChange={(event) => this.issue.result_comment_issue = event.target.value}
								required
							/>
							<button type="submit">Выпустить</button>
						</form>

					</>
				}
			</div >
		)
	}
}

export default withRouter(Application);