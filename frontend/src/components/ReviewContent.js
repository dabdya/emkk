import React from "react";
import { STATUS } from "../utils/Constants";
import review from '../images/review.png';

export default class ReviewContent extends React.Component {
	constructor(props) {
		super(props);
		this.reviewer = this.props.reviewer;
		this.result = this.props.result;
		this.comment = this.props.comment;
		this.file = this.props.file;
	}

	render() {
		return (
			<div className="wrapper" style={{ backgroundColor: "#CFCFCF", border: "1.5px solid", marginRight: "49px" }}>
				<div className="status" style={{ marginLeft: "10px", paddingTop: "10px", display: "flex", alignItems: "center" }}>
					<img alt="" src={review} height="50px" width="50px" />
					<span style={{ marginLeft: "3px" }}>{STATUS[this.result]}</ span>
				</div>
				<div className="comment" style={{ backgroundColor: "#FFFFFF", height: "fit-content", minHeight: "150px", margin: "20px 30px 10px 30px", border: "1.5px solid" }}>
					{this.comment}
				</div>
				<div className="signature" style={{ marginLeft: "28px", marginBottom:"10px" }}>
					{`${this.reviewer.first_name} ${this.reviewer.last_name}`}
				</div>
			</div >
		);
	}
}