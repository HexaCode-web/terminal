import React from "react";
import { Button, Modal } from "react-bootstrap";

function MyModal(props) {
  return (
    <Modal show={props.show} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.children}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.handleClose}>
          Close
        </Button>
        {props.primaryButtonText && (
          <Button variant="primary" onClick={props.handlePrimaryAction}>
            {props.primaryButtonText}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default MyModal;
