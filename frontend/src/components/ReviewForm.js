import React from "react";
import Requests from "../utils/requests";
import TextField from "@mui/material/TextField";
import { getToken } from "../utils/Common";

export default class ReviewContent extends React.Component {
	constructor(props) {
		super(props);
		this.requests = new Requests();
		this.review = {}
		this.write = this.write.bind(this);
		this.config = this.config.bind(this);
	}

	config() {
		return {
			headers: {
				Authorization: "Token " + getToken()
			}
		}
	};
	
	write(e) {
		e.preventDefault()
		const id = this.props.id;
		const url = this.props.isReview
			? `${process.env.REACT_APP_URL}/api/trips/${id}/reviews`
			: `${process.env.REACT_APP_URL}/api/trips/${id}/reviews-from-issuer`;

		this.requests.post(url,
			{ result: e.nativeEvent.submitter.name, result_comment: e.target[0].value },
			this.config())
			.then(resp => {
				this.props.setter(resp, this.props.isReview);
				const fileUrl = this.props.isReview
					? `${process.env.REACT_APP_URL}/api/trips/${id}/reviews/${resp.data.id}/documents`
					: `${process.env.REACT_APP_URL}/api/trips/${id}/reviews-from-issuer/${resp.data.id}/documents`;
				const form = new FormData();
				form.append("file", e.target[3].files[0]);
				this.requests.post(fileUrl,
					form,
					this.config())
					.then(resp => {
						this.props.addFile(resp.data[0], this.props.isReview);
					});
			});
	}

	render() {
		return (
			<form className="review-form" onSubmit={this.write}>
				<TextField
					name="result_comment"
					placeholder="Текст"
					multiline
					rows={7}
					required
					style={{ width: "100%" }}
				/>
				<input type="file" />
				<div id="buttons">
					<button type="submit" name="accepted">Одобрить</button>
					<button type="submit" name="on_rework">На доработку</button>
					<button type="submit" name="rejected">Отклонить</button>
				</div>
			</form>
		);
	}
}