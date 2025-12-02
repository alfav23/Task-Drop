"use client"
import React, { useContext, useEffect, useState } from "react";
import styles from "./Dashboard.module.scss";
import { addDoc, collection, deleteDoc, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { getAuth } from "firebase/auth";
import {closestCorners, DndContext, useDraggable, useDroppable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';
import Modal from "../Modal";
// import { useAuth } from "./../../context/AuthContext";
import { FaHandPaper, FaHandRock, FaTrash } from "react-icons/fa";

export default function Dashboard(): any {
    const auth = getAuth();
    const user = auth.currentUser;
    const uid = user?.uid;
    console.log(user);
    
    const [ title, setTitle ] = useState('');
    const [ content, setContent ] = useState('');
    const [ isInProgress, setIsInProgress ] = useState(false);
    const [ isCompleted, setIsCompleted ] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => {
        setShowModal(false);
        setTitle('');
        setContent('');
    }

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


    const addNewTask = async(event: React.FormEvent) => {
        event.preventDefault()
        const newTask = await addDoc(collection(db, "tasks"), {
                title: title, 
                createdBy: user?.displayName,
                createdAt: new Date(),
                content: content,
                inProgress: false,
                completed: false
            });
            console.log(newTask, newTask.id)
            handleCloseModal();
            await fetchToDoTasks();
    }

    const deleteTask = async(task: any) => {
        await deleteDoc(doc(db, "tasks", task.id))
        if (task.completed === false && task.inProgress === false){
            await fetchToDoTasks();
        }
        if (task.completed === false && task.inProgress === true){
            await fetchInProgressTasks();
        } else {
            await fetchToDoTasks();
        }
    }

    const markStarted = async(task: any) => {
        await setDoc(doc(db, "tasks", task.id), {
            inProgress: true,
            completed: false
        });
        await fetchInProgressTasks();
    }

    const markComplete = async(task: any) => {
        await setDoc(doc(db, "tasks", task.id), {
            inProgress: false,
            completed: true,
        });
        await fetchCompletedTasks();
    }
    
    const {setNodeRef: setFirstDroppableRef} = useDroppable({
        id: 'droppable-1',
    });

    const {setNodeRef: setSecondDroppableRef} = useDroppable({
        id: 'droppable-2',
    });

    const {setNodeRef: setThirdDroppableRef} = useDroppable({
        id: 'droppable-3',
    });

    //draggable element
    const Draggable = ({task, children}: any) => {

        const { listeners, attributes, setNodeRef: setDraggableRef, transform} = useDraggable({
            id: task.id,
        });

        const style = {
            transform: CSS.Translate.toString(transform),
        };

        return (
            <div ref={setDraggableRef} style={style}>
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

        return (
            <div className={styles.dashboard}>
                <DndContext collisionDetection={closestCorners}>
                    <div ref={setFirstDroppableRef} className={styles.toDoTasks}>
                        <h1>To Do</h1>
                        {toDoTasks.map((task) => (
                            
                            <div key={task.id}>
                                <Draggable task={task}>
                                    <h2>{task.title}</h2>
                                    <span>{task.createdBy}</span>
                                    <p>{task.content}</p>
                                    <button 
                                        className={styles.deleteButton} 
                                        onClick={() => deleteTask(task)}
                                    >
                                    <FaTrash />
                                    </button>
                                </ Draggable >
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
                        <h1>In Progress</h1>
                        {inProgressTasks.map((task) => (
                            <div key={task.id}>
                                <Draggable task={task}>
                                    <h2>{task.title}</h2>
                                    <span>{task.createdBy}</span>
                                    <p>{task.content}</p>
                                    <button 
                                        className={styles.deleteButton} 
                                        onClick={() => deleteTask(task)}
                                    >
                                    <FaTrash />
                                    </button>
                                </ Draggable > 
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
                        <h1>Completed</h1>
                        {completedTasks.map((task) => (
                            <div key={task.id}>
                                <Draggable task={task}>
                                    <h2>{task.title}</h2>
                                    <span>{task.createdBy}</span>
                                    <p>{task.content}</p>
                                    <button 
                                        className={styles.deleteButton} 
                                        onClick={() => deleteTask(task)}
                                    >
                                    <FaTrash />
                                    </button>
                                </ Draggable > 
                            </div>
                        ))}
                        <button 
                            className={styles.newTask}
                            onClick={handleOpenModal}
                        >
                            + New Task
                        </button>
                    </div>
                    {/* modal for new task */}
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
                            <button onClick={addNewTask}>Publish</button>
                        </form>
                    </Modal>
                </DndContext>
            </div>
        )
    }