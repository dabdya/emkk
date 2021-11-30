import React from "react";
import { STATUS } from "../utils/Constants";

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
			<div className="wrapper">
				<div className="status">
					{STATUS[this.result]}
				</div>
				<div className="content">
					{this.comment}
				</div>
				<div className="signature">
					{`${this.reviewer.first_name} ${this.reviewer.last_name}`}
				</div>
			</div>
		);
	}
}