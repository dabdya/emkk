import React from "react";

export default class NotFound extends React.Component {

	render() {
		return (
			<h3>
				Извините, страница <code>{this.props.location.pathname}</code> не найдена
			</h3>
		);
	}
}