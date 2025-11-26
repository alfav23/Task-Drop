"use client"
import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.scss";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { getAuth } from "firebase/auth";
import {useDroppable} from '@dnd-kit/core';
import Modal from "../Modal";

export default function Dashboard(): any {
    const auth = getAuth();
    const user = auth.currentUser ?? null;
    const uid = user?.uid
    
    const [ title, setTitle ] = useState('');
    const [ content, setContent ] = useState('');
    const [ isInProgress, setIsInProgress ] = useState(false);
    const [ isCompleted, setIsCompleted ] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const tasks = collection(db, "tasks");
    console.log(tasks);
    const tdQ = query(tasks, where("inProgress", "==", false), where("completed", "==", false));
    const [toDoTasks, setToDoTasks] = useState<any[]>([]);

    const ipQ = query(tasks, where("inProgress", "==", true));
    const [inProgressTasks, setInProgressTasks] = useState<any[]>([]);

    const cQ = query(tasks, where("completed", "==", true));
    const [completedTasks, setCompletedTasks] = useState<any[]>([]);

    const fetchToDoTasks = async() => {
        const querySnapshot = await getDocs(tdQ);
        const todo = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setToDoTasks(todo);
    };

    useEffect(() => {
        fetchToDoTasks();
    }, []);

    const fetchInProgressTasks = async() => {
        const querySnapshot = await getDocs(ipQ);
        const progress = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInProgressTasks(progress);
    };

    useEffect(() => {
        fetchInProgressTasks();
    }, []);

    const fetchCompletedTasks = async() => {
        const querySnapshot = await getDocs(cQ);
        const done = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCompletedTasks(done);
    };

    useEffect(() => {
        fetchCompletedTasks();
    }, []);


    const addNewTask = async(task: any) => {
        await setDoc(doc(db, "tasks", task.id), {
                title: title, 
                createdBy: uid,
                createdAt: new Date(),
                content: content,
                inProgress: false,
                completed: false
            });
    }
    
    function MultipleDroppables() {
        const {setNodeRef: setFirstDroppableRef} = useDroppable({
            id: 'droppable-1',
        });
        const {setNodeRef: setSecondDroppableRef} = useDroppable({
            id: 'droppable-2',
        });
        const {setNodeRef: setThirdDroppableRef} = useDroppable({
            id: 'droppable-3',
        });

        return (
            <div className={styles.dashboard}>
                <h1>To Do</h1>
                <div ref={setFirstDroppableRef} className={styles.toDoTasks}>
                    {toDoTasks.map((task) => (
                        <div key={task.id} className={styles.taskContainer}>
                            <h2>{task.title}</h2>
                            <span>{task.createdBy}</span>
                            <p>{task.content}</p>
                        </div>
                    ))}
                    <button 
                        className={styles.newTask}
                        onClick={handleOpenModal}
                    >
                        + New Task
                    </button>
                </div>
                <div ref={setSecondDroppableRef} className={styles.inProgressTasks}>
                    In Progress
                    {inProgressTasks.map((task) => (
                        <div key={task.id} className={styles.taskContainer}>
                            <h2>{task.title}</h2>
                            <span>{task.createdBy}</span>
                            <p>{task.content}</p>
                        </div>
                    ))}
                    <button 
                        className={styles.newTask}
                        onClick={handleOpenModal}
                    >
                        + New Task
                    </button>
                </div>
                <div ref={setThirdDroppableRef} className={styles.completedTasks}>
                    Completed
                    {completedTasks.map((task) => (
                        <div key={task.id} className={styles.taskContainer}>
                            <h2>{task.title}</h2>
                            <span>{task.createdBy}</span>
                            <p>{task.content}</p>
                        </div>
                    ))}
                    <button 
                        className={styles.newTask}
                        onClick={handleOpenModal}
                    >
                        + New Task
                    </button>
                </div>
                <Modal show={showModal} onClose={handleCloseModal}>
                    <form>
                        <input 
                            type="text"
                            placeholder="Name your new task"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)} 
                        />
                        <input 
                            type="text"
                            placeholder="Describe your new task" 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <button onSubmit={addNewTask}>Publish</button>
                    </form>
                </Modal>
            </div>
        )
    } MultipleDroppables;
}