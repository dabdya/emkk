import {Button, Modal} from "@skbkontur/react-ui";
import React from "react";

export default class ShowModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <Modal onClose={this.props.close}>
                <Modal.Header>ЭМКК</Modal.Header>
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
