import React from "react";
import TextField from "@mui/material/TextField";
import { Button } from "@skbkontur/react-ui";
import ShowModal from "./ShowModal";
import { STATUS } from "../utils/Constants";
import Requests from "../utils/requests";
import { getToken, getUser } from "../utils/Common";
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

		this.requests = new Requests();
		this.reviewer = this.props.reviewer;
		this.result = this.props.result;
		this.comment = this.props.comment;
		this.file = this.props.file;
		this.getImage = this.getImage.bind(this);
		this.open = this.open.bind(this);
		this.close = this.close.bind(this);
		this.changeEditing = this.changeEditing.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.config = this.config.bind(this);
	}

	async onSubmit(e) {
		e.preventDefault();
		await this.requests.patch(`${process.env.REACT_APP_URL}/api/reviews/${this.props.id}`,
			{ result_comment: e.target[0].value, result: e.nativeEvent.submitter.name }, this.config())
			.then(() => {
				this.comment = e.target[0].value;
				this.result = e.nativeEvent.submitter.name;
				this.changeEditing()
			})
	}

	config() {
		return {
			headers: {
				Authorization: "Token " + getToken()
			}
		}
	};

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
			<div className="wrapper" style={{ backgroundColor: "#D4D4D4", borderRadius: 10, marginRight: "49px" }}>
				<div className="status" style={{
					marginLeft: "37px",
					paddingTop: "22px",
					display: "flex",
					alignItems: "center"
				}}>
					<img alt="" src={this.getImage()} height="50px" width="50px" />
					<div style={{ marginLeft: "13.02px", height: "50" }}>
						<a href="#" onClick={this.open} style={{ marginLeft: "3px", fontSize: 18 }}>{this.reviewer?.first_name} {this.reviewer?.last_name} {this.reviewer?.patronymic}</ a> < br />
						<span style={{ marginLeft: "3px", fontSize: 16 }}>Рецензент</ span> < br />
						<span style={{ marginLeft: "3px", fontSize: 14 }}>статус: {STATUS[this.result]}</ span> < br />
					</div>
				</div>
				<div className="comment" style={{
					height: "fit-content",
					minHeight: "150px",
					margin: "20px 30px 10px 30px",
					padding: "10px 10px"
				}}>
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
				{this.reviewer.username === getUser() && <Button onClick={this.changeEditing} style={{ marginLeft: 20 }}>Редактировать заявку</Button>}
				{this.state.editing &&
					<form onSubmit={this.onSubmit}>
						<TextField
							name="info_for_reviewer"
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
					close={this.close} message={getText(this.reviewer)}></ShowModal>}
			</div >
		);
	}
}