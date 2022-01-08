import React from "react";
import request from "../utils/requests";
import TextField from "@mui/material/TextField";

export default class ReviewContent extends React.Component {
	constructor(props) {
		super(props);
		this.review = {}
		this.write = this.write.bind(this);
		this.patch = this.patch.bind(this);
	}

	write(e) {
		e.preventDefault()
		const id = this.props.id;
		const url = this.props.isReview
			? `/api/trips/${id}/reviews`
			: `/api/trips/${id}/reviews-from-issuer`;

		request.post(url,
			{ result: e.nativeEvent.submitter.name, result_comment: e.target[0].value })
			.then(resp => {
				this.props.setter(resp, this.props.isReview);
				const fileUrl = this.props.isReview
					? `/api/trips/${id}/reviews/${resp.data.id}/documents`
					: `/api/trips/${id}/reviews-from-issuer/${resp.data.id}/documents`;
				const form = new FormData();
				form.append("file", e.target[3].files[0]);
				request.post(fileUrl,
					form)
					.then(resp => {
						this.props.addFile(resp.data[0], this.props.isReview);
					});
			});
	}

	patch(e) {
		e.preventDefault()
		const id = this.props.id;

		request.patch(`/api/reviews/${id}`,
			{ result: e.nativeEvent.submitter.name, result_comment: e.target[0].value })
			.then(resp => {
				this.props.setter(resp, this.props.isReview);
				const fileUrl = this.props.isReview
					? `/api/trips/${id}/reviews/${resp.data.id}/documents`
					: `/api/trips/${id}/reviews-from-issuer/${resp.data.id}/documents`;
				const form = new FormData();
				form.append("file", e.target[3].files[0]);
				request.post(fileUrl,
					form)
					.then(resp => {
						this.props.addFile(resp.data[0], this.props.isReview);
					});
			});
	}

	render() {
		return (
			<form className="review-form" onSubmit={this.patch}>
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