'use client'
import React from "react";
import styles from "./Modal.module.scss";

export default function Modal({ show, onClose, children }: any) {
    if (!show) {
        return null;
    }
    return(
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <button className={styles.modalCloseButton} onClick={onClose}>
                    &times;
                </button>
                {children}
            </div>
        </div>
    )
}