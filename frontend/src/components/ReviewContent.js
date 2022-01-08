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
		e.preventDefault();
		await request.patch(`/api/reviews/${this.props.id}`,
			{ result_comment: e.target[0].value, result: e.nativeEvent.submitter.name })
			.then(() => {
				this.comment = e.target[0].value;
				this.result = e.nativeEvent.submitter.name;
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
				{this.reviewer.username === getUser() && <Button onClick={this.changeEditing} style={{ marginLeft: 20 }}>Редактировать рецензию</Button>}
				{this.state.editing &&
					<ReviewForm {...this.props} />}
				{this.state.buttonIsPressed && <ShowModal header={`${this.reviewer?.first_name} ${this.reviewer?.last_name} ${this.reviewer?.patronymic}`}
					close={this.close} message={getText(this.reviewer)} />}
			</div >
		);
	}
}