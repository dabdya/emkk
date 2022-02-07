import React from "react";
import { withRouter } from "react-router-dom";
import { Button, Select } from "@skbkontur/react-ui";
import TextField from "@mui/material/TextField";
import ReviewContent from "./ReviewContent";
import { KIND_OF_TOURISM, GLOBAL_AREA } from "../utils/Constants";
import request from "../utils/requests";
import { getUser } from "../utils/Common";
import icon from "../images/delete.ico";
import ReviewForm from "./ReviewForm";


class Application extends React.Component {

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

		this.app = {}

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
		this.changeStatus = this.changeStatus.bind(this);
		this.setter = this.setter.bind(this);
	}


	async componentDidMount() {
		const response = await request.get(`/api/trips/${this.id}`).catch(() => this.props.history.push("/"));
		this.app = response.data;
		this.setState({ status: this.app.status });

		const files = (await request.get(`/api/trips/${this.id}/documents`)).data;
		files.forEach(file => {
			this.setState(prevState => ({
				files: [...prevState.files, { uuid: file.uuid, filename: file.filename }]
			}))
		});

		const reviews = (await request.get(`/api/trips/${this.id}/reviews`)).data;
		this.setState({ reviews: reviews });
		reviews.forEach(async review => {
			const reviewsFiles = (await request.get(`/api/trips/${this.id}/reviews/${review.id}/documents`)).data;
			this.setState({ reviewsFiles: reviewsFiles });
		});

		const issues = (await request.get(`/api/trips/${this.id}/reviews-from-issuer`)).data;
		issues.forEach(async issue => {
			const issuesFiles = (await request.get(`/api/trips/${this.id}/reviews-from-issuer/${issue.id}/documents`)).data;
			this.setState({ issuesFiles: issuesFiles });
		});
	};

	setter(data, isReview) {
		const name = isReview ? "reviews" : "issues";
		this.setState(prevState => ({
			status: data.trip.status,
			[name]:
				[...prevState[name],
				{
					id: data.id,
					result: data.result,
					result_comment: data.result_comment,
					reviewer: data.reviewer,
				}]
		}));
	};

	changeTourismKind(value) {
		this.app.kind = KIND_OF_TOURISM[value];
	};

	async changeStatus(e) {
		e.preventDefault();
		await request.post(`/api/trips/${this.app.id}/change-status?new_status=${e.nativeEvent.target[0].value}`, {})
	};

	async createBlob(e, file) {
		e.preventDefault()

		const response = await request.get(`/api/documents/${file.uuid}`, { responseType: "arraybuffer" });
		const blob = new Blob([response.data], { type: response.headers["content-type"] });

		const link = document.createElement("a")
		link.download = file.filename;
		link.href = URL.createObjectURL(blob);
		link.click();
		link.remove();
	};



	async onSubmit(event) {
		event.preventDefault();
		const { id, isEditing, files, reviews, ...data } = this.app;
		this.app.last_modified_at = (await request.patch(`/api/trips/${id}`, data)).data.last_modified_at;
		this.changeEditing();
	}

	changeEditing() {
		this.setState({ isEditing: !this.state.isEditing });
	}

	async deleteDocument(file) {
		await request.delete(`/api/documents/${file.uuid}`);
		this.setState(prevState => ({ files: prevState.files.filter(item => item.uuid !== file.uuid) }));

	}

	async deleteDocumentInReview(file) {
		await request.delete(`/api/documents/${file.uuid}`);
		this.setState(prevState => ({
			reviewsFiles: prevState.reviewsFiles.filter(item => item.uuid !== file.uuid),
			issuesFiles: prevState.issuesFiles.filter(item => item.uuid !== file.uuid)
		}));
	}

	addFileInReview(file, isReview) {
		const name = isReview ? "reviewsFiles" : "issuesFiles";
		this.setState(prevState => ({ [name]: [...prevState[name], file] }));
	}

	async addDocument(newFiles) {
		const files = newFiles.target.files;

		const form = new FormData()
		for (const file of files) {
			form.append("file", file);
		}

		const data = (await request.post(`/api/trips/${this.id}/documents`, form)).data;

		for (const item of data) {
			this.setState(prevState => ({ files: [...prevState.files, { uuid: item.uuid, filename: item.filename }] }));
		}
	}

	render() {
		const { isEditing, issues, files, reviews, status } = this.state;
		const tourismVariants =
			["Пеший", "Лыжный", "Водный", "Горный", "Пеше-водный",
				"Спелео", "Велотуризм", "Парусный", "Конный", "Авто-мото"];
		const changeApp = e => this.app[e.target.name] = e.target.value;

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
						<span style={{ marginLeft: 10 }}>Последнее изменение: {new Date(this.app?.last_modified_at).toLocaleString()}</span>
					</div>
					<div id="data-application">
						<div className="cell-app">
							<div>ФИО руководителя:</div>
							<div>{`${this.app.leader?.first_name} ${this.app.leader?.last_name} ${this.app.leader?.patronymic ? this.app.leader?.patronymic : ""}`}</div>
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
									<Select items={GLOBAL_AREA} defaultValue={this.app.global_region}
										onValueChange={value => this.app.global_region = value} required />
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
								? <input defaultValue={this.app.coordinator_name} name="coordinator_name" onChange={changeApp} />
								: this.app.coordinator_name}</div>
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
						<div className="cell-app">
							<div>Номер координатора:</div>
							<div>{isEditing
								? <input defaultValue={this.app.coordinator_phone_number} name="coordinator_phone_number" onChange={changeApp} />
								: this.app.coordinator_phone_number}</div>
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
							{files.map((file, i) => {
								return (
									<div key={i}>
										{/*eslint-disable-next-line */}
										<a onClick={(e) => this.createBlob(e, file)} href="#" target="_blank">{file.filename}</a>
										{getUser() === this.app.leader?.username &&
											<img src={icon} onClick={() => this.deleteDocument(file)} alt="delete" className="deleteIcon" />}
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
							{getUser() === this.app.leader?.username && <Button onClick={() => this.refs.fileInput.click()}>Добавить документы</Button>}
						</div>
					</div>
				</div >
				<div className="separator">
					<hr />
				</div>
				<div className="box">
					Рецензии
					{reviews.map(review =>
						<ReviewContent isReview={true} files={this.state.reviewsFiles} result={review.result} comment={review.result_comment}
							reviewer={review.reviewer} id={review.id} addFile={this.addFileInReview} key={review.id} createBlob={this.createBlob} deleteDocument={this.deleteDocumentInReview} />
					)}
					{
						this.roles.reviewer &&
						(status === "on_review" ||
							status === "at_issuer") &&
						reviews.filter(rev => rev.reviewer.username === getUser()).length === 0 &&
						<ReviewForm isReview={true} id={this.id} setter={this.setter} addFile={this.addFileInReview} />
					}
				</div>
				<div className="box">
					Выпуски
					{issues.map(issue =>
						<ReviewContent files={this.state.issuesFiles} id={issue.id} result={issue.result} comment={issue.result_comment}
							reviewer={issue.reviewer} key={issue.id} addFile={this.addFileInReview} createBlob={this.createBlob} deleteDocument={this.deleteDocumentInReview} />
					)}
					{
						this.roles.issuer &&
						status === "at_issuer" &&
						!issues[0] &&
						<ReviewForm id={this.id} setter={this.setter} addFile={this.addFileInReview} />
					}
				</div>
			</div >
		)
	}
}

export default withRouter(Application);