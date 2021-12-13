import React from "react";
import { STATUS } from "../utils/Constants";
import rework from '../images/rework.png';
import accepted from '../images/accepted.png';
import rejected from '../images/rejected.png';
import ShowModal from "./ShowModal";
export default class ReviewContent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			buttonIsPressed: false,
		}

		this.reviewer = this.props.reviewer;
		this.result = this.props.result;
		this.comment = this.props.comment;
		this.file = this.props.file;
		this.getImage = this.getImage.bind(this);
		this.open = this.open.bind(this);
		this.close = this.close.bind(this);
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
		this.setState(() => ({ buttonIsPressed: true }))
	}

	close() {
		this.setState(() => ({ buttonIsPressed: false }))
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
						<a href="#" onClick={this.open} style={{ marginLeft: "3px", fontSize: 18 }}>{this.reviewer.first_name} {this.reviewer.last_name} {this.reviewer.patronymic}</ a> < br />
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
				</div>
				{this.state.buttonIsPressed && <ShowModal header={`${this.reviewer.first_name} ${this.reviewer.last_name} ${this.reviewer.patronymic}`}
					close={this.close} message={getText(this.reviewer)}></ShowModal>}
			</div >
		);
	}
}