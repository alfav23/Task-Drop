import {useDraggable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';
import styles from "./Draggable.module.scss";
import { FaHandPaper } from "react-icons/fa";

export default function Draggable({task, children}: any) {

        const { listeners, attributes, setNodeRef: setDraggableRef, transform} = useDraggable({
            id: task.id,
        });

        const style = {
            transform: CSS.Translate.toString(transform),
        };

        return (
            <div className={styles.taskContainer} ref={setDraggableRef} style={style}>
                <button 
                    {...listeners} 
                    {...attributes} 
                    className={styles.draggableListener}
                >
                    <FaHandPaper /> 
                </button>
                {children}
            </div>
        )
    }