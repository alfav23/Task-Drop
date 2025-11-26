'use client'

import React from "react";
import styles from "./Modal.module.scss";

export default function Modal({ show, onClose, children }: any) {
    if (!show) {
        return null;
    }
    return(
        <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
    )
}