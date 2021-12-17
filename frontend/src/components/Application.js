import React from "react";
import { withRouter } from "react-router-dom";
import { Button, Select, ComboBox } from "@skbkontur/react-ui";
import TextField from "@mui/material/TextField";
import ReviewContent from "./ReviewContent";
import { KIND_OF_TOURISM, GLOBAL_AREA, STATUS } from "../utils/Constants";
import Requests from "../utils/requests";
import { getToken, getUser } from "../utils/Common";
import icon from "../images/delete.ico";
import ReviewForm from "./ReviewForm";


class Application extends React.Component {

	requests = new Requests();
	constructor(props) {
		super(props);
		this.state = {
			isEditing: false,
			files: [],
			reviews: [],
			issues: [],
			issuesFiles: [],
			reviewsFiles: [],
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
			info_for_reviewer: "",
			status: "",
		}

		this.roles = this.props.roles;
		this.id = this.props.match.params.id;

		this.changeEditing = this.changeEditing.bind(this);
		this.changeTourismKind = this.changeTourismKind.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.createBlob = this.createBlob.bind(this);
		this.deleteDocument = this.deleteDocument.bind(this);
		this.deleteDocumentInReview = this.deleteDocumentInReview.bind(this);
		this.addDocument = this.addDocument.bind(this);
		this.addFileInReview = this.addFileInReview.bind(this);
		this.config = this.config.bind(this);
		this.uploadReview = this.uploadReview.bind(this);
		this.changeStatus = this.changeStatus.bind(this);
		this.setter = this.setter.bind(this);
	}

	config() {
		return {
			headers: {
				Authorization: "Token " + getToken()
			}
		}
	};

	async componentDidMount() {
		this.requests.get(`${process.env.REACT_APP_URL}/api/trips/${this.id}`, this.config())
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
					last_modified_at: response.data.last_modified_at,
					info_for_reviewer: response.data.info_for_reviewer,
				}
				this.setState({ status: response.data.status });
			})
			.catch(err => this.props.history.push("/"));

		this.requests.get(`${process.env.REACT_APP_URL}/api/trips/${this.id}/documents`, this.config())
			.then(async resp => {
				resp.data.forEach(file => {
					this.setState(prevState => ({
						files: [...prevState.files, { uuid: file.uuid, filename: file.filename }]
					}))
				});
			});

		await this.requests.get(`${process.env.REACT_APP_URL}/api/trips/${this.id}/reviews`, this.config())
			.then(resp => {
				this.setState({ reviews: resp.data });
				resp?.data?.map(async review => {
					await this.requests.get(`${process.env.REACT_APP_URL}/api/trips/${this.id}/reviews/${review.id}/documents`, this.config())
						.then(resp => {
							this.setState({ reviewsFiles: resp.data });
						})
				})
			})
			.catch(err => console.error(err));

		await this.requests.get(`${process.env.REACT_APP_URL}/api/trips/${this.id}/reviews-from-issuer`, this.config())
			.then(resp => {
				this.setState({ issues: resp.data });
				resp?.data?.map(async issue => {
					await this.requests.get(`${process.env.REACT_APP_URL}/api/trips/${this.id}/reviews-from-issuer/${issue.id}/documents`, this.config())
						.then(resp => {
							this.setState({ issuesFiles: resp.data });
						})
				})
			})
			.catch(err => console.error(err));
	};

	async uploadReview(e) {
		const file = e.target.files[0];

		await this.requests.post(`${process.env.REACT_APP_URL}/api/trips/${this.id}/reviews`,
			{ result: STATUS[this.state.result], result_comment: STATUS[this.state.result] },
			this.config())
			.then(resp => {
				const form = new FormData()
				form.append("file", file);
				this.requests.post(`${process.env.REACT_APP_URL}/api/trips/${this.id}/reviews/${resp.data.id}/documents`,
					form,
					this.config())
			});

		await this.requests.get(`${process.env.REACT_APP_URL}/api/trips/${this.id}/reviews`, this.config())
			.then(resp => {
				this.setState({ reviews: resp.data });
			})
			.catch(err => console.error(err));
	}

	setter(resp, isReview) {
		const name = isReview ? "reviews" : "issues";
		this.setState(prevState => ({
			status: resp.data.trip.status,
			[name]:
				[...prevState[name],
				{
					id: resp.data.id,
					result: resp.data.result,
					result_comment: resp.data.result_comment,
					reviewer: resp.data.reviewer,
				}]
		}));
	}

	changeTourismKind(value) {
		this.app.kind = KIND_OF_TOURISM[value];
	};

	changeStatus(e) {
		e.preventDefault();
		this.requests.post(`${process.env.REACT_APP_URL}/api/trips/${this.app.id}/change-status?new_status=${e.nativeEvent.target[0].value}`, {},
			this.config())
			.then(resp => { console.log(resp); })
	}

	async createBlob(e, file) {
		e.preventDefault()
		let mime;
		const resp = await this.requests.get(`${process.env.REACT_APP_URL}/api/documents/${file.uuid}`, { ...this.config(), responseType: "arraybuffer" })
			.then(resp => {
				mime = resp.headers["content-type"];
				return resp;
			})
		const blob = new Blob([resp.data], { type: mime });
		const a = document.createElement("a")
		a.download = file.filename;
		a.href = URL.createObjectURL(blob);
		a.click();
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

	deleteDocument(file) {
		this.requests.delete(`${process.env.REACT_APP_URL}/api/documents/${file.uuid}`,
			this.config())
			.then(() => {
				this.setState(prevState => ({ files: prevState.files.filter(item => item.uuid !== file.uuid) }));
			})
	}

	deleteDocumentInReview(file) {
		this.requests.delete(`${process.env.REACT_APP_URL}/api/documents/${file.uuid}`,
			this.config())
			.then(() => {
				this.setState(prevState => ({ reviewsFiles: prevState.reviewsFiles.filter(item => item.uuid !== file.uuid) }));
				this.setState(prevState => ({ issuesFiles: prevState.issuesFiles.filter(item => item.uuid !== file.uuid) }));
			})
	}

	addFileInReview(file, isReview) {
		const name = isReview ? "reviewsFiles" : "issuesFiles";
		this.setState(prevState => ({ [name]: [...prevState[name], file] }));
	}

	addDocument(afile) {
		const files = afile.target.files;

		const form = new FormData()
		for (const file of files) {
			form.append("file", file);
		}

		this.requests.post(`${process.env.REACT_APP_URL}/api/trips/${this.id}/documents`, form,
			this.config())
			.then(resp => {
				for (const item of resp.data) {
					this.setState(prevState => ({ files: [...prevState.files, { uuid: item.uuid, filename: item.filename }] }));
				}
			})
	}

	render() {
		const { isEditing, issues, files, reviews, status } = this.state;
		const tourismVariants = ["Пеший", "Лыжный", "Водный", "Горный", "Пеше-водный",
			"Спелео", "Велотуризм", "Парусный", "Конный", "Авто-мото"];
		const getItems = query =>
			Promise.resolve(
				GLOBAL_AREA.map(item => { return { value: item, label: item } })
					.filter(item => item.value.toLowerCase().startsWith(query.toLowerCase()))
			);
		const changeApp = e => this.app[e.target.name] = e.target.value;
		const changeComboBox = e => this.app.global_region = e.value;

		return (
			<div id="application" >
				{this.roles.secretary && <form onSubmit={this.changeStatus}>
					<select>
						<option value="ALARM">Аварийная ситуация</option>
						<option value="ROUTE_COMPLETED">Маршрут завершен</option>
						<option value="ON_ROUTE">На маршруте</option>
						<option value="TAKE_PAPERS">В работе</option>
					</select>
					<button type="submit">Сменить статус</button>
				</form>}
				<form onSubmit={this.onSubmit}>
					<div id="data-application-header">
						<h1 id="data-application-name">Заявка №{this.app.id}</h1>
						{!isEditing && getUser() === this.app.leader?.username && <Button onClick={this.changeEditing} style={{ marginLeft: 20 }}>Редактировать заявку</Button>}
						{isEditing && <Button type="submit" style={{ marginLeft: 20 }} >Сохранить</Button>}
						{isEditing && <Button type="submit" onClick={this.changeEditing} style={{ marginLeft: 20 }} >Отмена</Button>}
						<span style={{ marginLeft: 10 }}>Последнее изменение: {new Date(this.app.last_modified_at).toLocaleString()}</span>
					</div>
					<div id="data-application">
						<div className="cell-app">
							<div>ФИО руководителя:</div>
							<div>{`${this.app.leader.first_name} ${this.app.leader.last_name} ${this.app.leader.patronymic}`}</div>
						</div>
						<div className="cell-app">
							<div>Спортивная организация:</div>
							<div>{isEditing
								? <input defaultValue={this.app.group_name} name="group_name" onChange={changeApp} />
								: this.app.group_name}</div>
						</div>
						<div className="cell-app">
							<div>Дата начала маршрута:</div>
							<div>{isEditing
								? <input type="date" defaultValue={this.app.start_date} name="start_date" onChange={changeApp} />
								: this.app.start_date}</div>
						</div>
						<div className="cell-app">
							<div>Страховая компания:</div>
							<div>{isEditing
								? <input type="text" defaultValue={this.app.insurance_company_name} name="insurance_company_name" onChange={changeApp} />
								: this.app.insurance_company_name}</div>
						</div>
						<div className="cell-app">
							<div>Дата окончания маршрута:</div>
							<div>{isEditing
								? <input type="date" defaultValue={this.app.end_date} name="end_date" onChange={changeApp} />
								: this.app.end_date}</div>
						</div>
						<div className="cell-app">
							<div>Срок действия полиса:</div>
							<div>{isEditing
								? <input type="date" defaultValue={this.app.insurance_policy_validity_duration}
									name="insurance_policy_validity_duration" onChange={changeApp} />
								: this.app.insurance_policy_validity_duration}</div>
						</div>
						<div className="cell-app">
							<div>Район:</div>
							<div>{isEditing
								? <>
									<ComboBox drawArrow={true}
										getItems={getItems}
										value={{ value: this.app.global_region, label: this.app.global_region }}
										onValueChange={changeComboBox}
										name="generalArea"
									/>
									<input defaultValue={this.app.local_region} name="local_region"
										onChange={changeApp}
									/>
								</>
								: `${this.app.global_region}, ${this.app.local_region}`}</div>
						</div>
						<div className="cell-app">
							<div>Число участников:</div>
							<div>{isEditing
								? <input type="text" pattern="^[0-9]+$" defaultValue={this.app.participants_count} name="participants_count" onChange={changeApp} />
								: this.app.participants_count}</div>
						</div>
						<div className="cell-app">
							<div>Вид туризма:</div>
							<div>{isEditing
								? <Select items={tourismVariants} defaultValue={KIND_OF_TOURISM[this.app.kind]} onValueChange={this.changeTourismKind} required />
								: KIND_OF_TOURISM[this.app.kind]}</div></div>
						<div className="cell-app">
							<div>Категория сложности:</div>
							<div>{isEditing
								? <input type="text" pattern="[1-6]" defaultValue={this.app.difficulty_category} name="difficulty_category" onChange={changeApp} />
								: this.app.difficulty_category}</div></div>
						<div className="cell-app">
							<div>Контрольный сроки начала:</div>
							<div>{isEditing
								? <>
									<input defaultValue={this.app.control_start_region}
										name="control_start_region"
										onChange={changeApp}
									/>
									<input defaultValue={this.app.control_start_date}
										type="date"
										name="control_start_date"
										onChange={changeApp}
									/>
								</>
								: `${this.app.control_start_region}, ${this.app.control_start_date}`}</div></div>
						<div className="cell-app">
							<div>Координатор-связной:</div>
							<div>{isEditing
								? <input defaultValue={this.app.coordinator} name="coordinator" onChange={changeApp} />
								: this.app.coordinator}</div>
						</div>
						<div className="cell-app">
							<div>Контрольные сроки конца:</div>
							<div>{isEditing
								? <>
									<input defaultValue={this.app.control_end_region}
										name="control_end_region"
										onChange={changeApp}
									/>
									<input defaultValue={this.app.control_end_date}
										type="date"
										name="control_end_date"
										onChange={changeApp}
									/>
								</>
								: `${this.app.control_end_region}, ${this.app.control_end_date}`}</div>
						</div>

					</div>
					<div id="info-for-reviewer">
						<>
							<div>Комментарий для рецензента</div>
							<TextField
								name="info_for_reviewer"
								defaultValue={this.app.info_for_reviewer}
								placeholder="Текст"
								multiline
								disabled={!isEditing}
								rows={7}
								onChange={changeApp}
								required
								style={{ width: "60%" }}
							/>
						</>
					</div>
				</form>
				<div className="separator">
					<hr />
				</div>

				<div className="box">
					<h1>Документы</h1>
					<div>
						<div id="files">
							{files.map(file => {
								return (
									<div>
										{/*eslint-disable-next-line */}
										<a onClick={(e) => this.createBlob(e, file)} href="#" target="_blank">{file.filename}</a>
										<img src={icon} onClick={() => this.deleteDocument(file)} alt="delete" className="deleteIcon" />
									</div>
								);
							})}
						</div>
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
				</div >
				<div className="separator">
					<hr />
				</div>
				<div className="box">
					Рецензии
					{reviews.map(review =>
						<ReviewContent files={this.state.reviewsFiles} result={review.result} comment={review.result_comment}
							reviewer={review.reviewer} id={review.id} key={review.id} createBlob={this.createBlob} deleteDocument={this.deleteDocumentInReview} />
					)}
				</div>
				{
					this.roles.reviewer &&
					(status === "on_review" ||
						status === "at_issuer") &&
					reviews.filter(rev => rev.reviewer.username === getUser()).length === 0 &&
					<ReviewForm isReview={true} id={this.id} setter={this.setter} addFile={this.addFileInReview} />
				}
				<div className="box">
					Выпуски
					{issues.map(issue =>
						<ReviewContent files={this.state.issuesFiles} id={issue.id} result={issue.result} comment={issue.result_comment}
							reviewer={issue.reviewer} key={issue.id} createBlob={this.createBlob} deleteDocument={this.deleteDocumentInReview} />
					)}
				</div>
				{
					this.roles.issuer &&
					status === "at_issuer" &&
					!issues[0] &&
					<ReviewForm id={this.id} setter={this.setter} addFile={this.addFileInReview} />
				}
			</div >
		)
	}
}

export default withRouter(Application);