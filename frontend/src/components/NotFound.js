import React from "react";

export default class NotFound extends React.Component {

	render() {
		return (
			<div id="not-found">
				<span>404</span>
				<span>
					Извините, страница <code>{this.props.location.pathname}</code> не найдена
				</span>
				<a href="/">Домой</a>
			</div>
		);
	}
}