import React from "react";

export default class NotFound extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<h3>
				Извините, страница <code>{this.props.location.pathname}</code> не найдена
			</h3>
		);
	}
}