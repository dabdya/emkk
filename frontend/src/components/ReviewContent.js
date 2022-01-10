import React from "react";
import TextField from "@mui/material/TextField";
import { Button } from "@skbkontur/react-ui";
import ShowModal from "./ShowModal";
import ReviewForm from "./ReviewForm";
import { STATUS } from "../utils/Constants";
import request from "../utils/requests";
import { getUser } from "../utils/Common";
import rework from "../images/rework.png";
import accepted from "../images/accepted.png";
import rejected from "../images/rejected.png";
import icon from "../images/delete.ico";

export default class ReviewContent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			buttonIsPressed: false,
			editing: false,
		}

		this.reviewer = this.props.reviewer;
		this.result = this.props.result;
		this.comment = this.props.comment;
		this.file = this.props.file;
		this.getImage = this.getImage.bind(this);
		this.open = this.open.bind(this);
		this.close = this.close.bind(this);
		this.changeEditing = this.changeEditing.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
	}

	async onSubmit(e) {
		const id = this.props.id;
		const isReview = this.props.isReview;
		e.preventDefault();
		await request.patch(`/api/reviews/${id}`,
			{ result_comment: e.target[0].value, result: e.nativeEvent.submitter.name })
			.then(resp => {
				this.comment = e.target[0].value;
				this.result = e.nativeEvent.submitter.name;
				const file = e.target[6].files[0];
				if (file) {
					const fileUrl = isReview
						? `/api/trips/${id}/reviews/${resp.data.id}/documents`
						: `/api/trips/${id}/reviews-from-issuer/${resp.data.id}/documents`;
					const form = new FormData();
					form.append("file", file);
					request.post(fileUrl,
						form)
						.then(resp => {
							this.props.addFile(resp.data[0], isReview);
						});
				}

				this.changeEditing()
			})
	}

	getImage() {
		if (this.result === "accepted") {
			return accepted;
		} else if (this.result === "rejected") {
			return rejected;
		}
		return rework;
	}

	open(e) {
		e.preventDefault();
		this.setState({ buttonIsPressed: true });
	}

	close() {
		this.setState({ buttonIsPressed: false });
	}

	changeEditing() {
		this.setState({ editing: !this.state.editing });
	}

	render() {

		const getText = (reviewer) => {
			return `Почта: ${reviewer.email}`;
		}

		return (
			<div className="review-content">
				<div className="status">
					<img alt="status" src={this.getImage()} height="50px" width="50px" />
					<div style={{ marginLeft: "13.02px", height: "50" }}>
						<a href="#" onClick={this.open} style={{ marginLeft: "3px", fontSize: 18 }}>{this.reviewer?.first_name} {this.reviewer?.last_name} {this.reviewer?.patronymic}</ a> < br />
						<span style={{ marginLeft: "3px", fontSize: 16 }}>Рецензент</ span> < br />
						<span style={{ marginLeft: "3px", fontSize: 14 }}>статус: {STATUS[this.result]}</ span> < br />
					</div>
				</div>
				<div className="comment">
					{this.comment}
					{this.props?.files?.map(file => {
						return (
							<div>
								{/*eslint-disable-next-line */}
								<a onClick={(e) => this.props.createBlob(e, file)} href="#" target="_blank">{file?.filename}</a>
								{this.state.editing && <img src={icon} onClick={() => this.props.deleteDocument(file)} alt="delete" className="deleteIcon" />}
							</div>
						);
					})}
				</div>
				{this.reviewer.username === getUser() && <Button onClick={this.changeEditing} style={{ marginLeft: 40, marginBottom: 10 }}>Редактировать рецензию</Button>}
				{this.state.editing &&
					<form
						className="review-content-editing"
						onSubmit={this.onSubmit}>
						<TextField
							defaultValue={this.comment}
							placeholder="Текст"
							multiline
							rows={7}
							required
							style={{ width: "60%" }}
						/>
						<div id="buttons">
							<button type="submit" name="accepted">Одобрить</button>
							<button type="submit" name="on_rework">На доработку</button>
							<button type="submit" name="rejected">Отклонить</button>
						</div>
						<input type="file" />
					</form>}
				{this.state.buttonIsPressed && <ShowModal header={`${this.reviewer?.first_name} ${this.reviewer?.last_name} ${this.reviewer?.patronymic}`}
					close={this.close} message={getText(this.reviewer)} />}
			</div >
		);
	}
}