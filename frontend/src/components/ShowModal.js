import { Button, Modal } from "@skbkontur/react-ui";
import React from "react";

export default class ShowModal extends React.Component {

	render() {
		return (
			<Modal onClose={this.props.close}>
				<Modal.Header>{this.props.header}</Modal.Header>
				<Modal.Body>
					<p>{this.props.message}</p>
				</Modal.Body>
				<Modal.Footer panel={true}>
					<Button onClick={this.props.close}>Закрыть</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
