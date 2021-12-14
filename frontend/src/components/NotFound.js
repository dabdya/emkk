import React from "react";

export default class NotFound extends React.Component {

	render() {
		return (
			<div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
				<span style={{ fontSize: 140 }}>404</span>
				<h1 style={{ fontSize: 30 }}>
					Извините, страница <code style={{ fontSize: 30 }}>{this.props.location.pathname}</code> не найдена
				</h1>
				<a href="/">Домой</a>
			</div>

		);
	}
}