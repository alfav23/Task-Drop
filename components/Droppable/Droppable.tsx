import { useDroppable } from "@dnd-kit/core";
import styles from "./Droppable.module.scss";

export default function Droppable ({ id, children }: any) {
    const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id });

    return (
        <div ref={setDroppableRef} style={{border: isOver? '1px solid white': 'none'}}>
            {children}
        </div>
    );
}