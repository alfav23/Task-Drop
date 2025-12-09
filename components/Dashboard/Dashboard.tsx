"use client"
import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.scss";
import { addDoc, collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { getAuth } from "firebase/auth";
import { closestCorners, DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import Modal from "../Modal";
import { FaTrash, FaEdit } from "react-icons/fa";
import Draggable from "../Draggable";
import Droppable from "../Droppable";

export default function Dashboard(): any {
    const auth = getAuth();
    const user = auth.currentUser;
    const uid = user?.uid;
    console.log(user);
    
    const [ title, setTitle ] = useState('');
    const [ content, setContent ] = useState('');
    const [ isInProgress, setIsInProgress ] = useState(false);
    const [ isCompleted, setIsCompleted ] = useState(false);

    const [showModalNew, setShowModalNew] = useState(false);
    const handleOpenModalNew = () => setShowModalNew(true);
    const handleCloseModalNew = () => {
        setShowModalNew(false);
        setTitle('');
        setContent('');
    }

    const [ updatedTitle, setUpdatedTitle] = useState('');
    const [ updatedContent, setUpdatedContent ] = useState('');
    const [ currentTaskId, setCurrentTaskId ] = useState('');

    const [showModalEdit, setShowModalEdit] = useState(false);
    const handleOpenModalEdit = (task: any) => {
        setShowModalEdit(true);
        setTitle(task.title);
        setContent(task.content);
        setCurrentTaskId(task.id);
    }

    const handleCloseModalEdit = () => {
        setShowModalEdit(false);
        setUpdatedTitle('');
        setUpdatedContent('');
    }

    const tasks = collection(db, "tasks");
    console.log(tasks);
    const tdQ = query(tasks, where("inProgress", "==", false), where("completed", "==", false), where("createdBy", "==", `${user?.displayName}`));
    const [toDoTasks, setToDoTasks] = useState<any[]>([]);

    const ipQ = query(tasks, where("inProgress", "==", true), where("createdBy", "==", `${user?.displayName}`));
    const [inProgressTasks, setInProgressTasks] = useState<any[]>([]);

    const cQ = query(tasks, where("completed", "==", true), where("createdBy", "==", `${user?.displayName}`));
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
            handleCloseModalNew();
            await fetchToDoTasks();
    }

    const updateTask = async (event: React.FormEvent) => {
        event.preventDefault();
        const colRef = collection(db, "tasks");
        const docRef = doc(colRef, currentTaskId);
        await updateDoc(docRef, {
            title: updatedTitle,
            content: updatedContent,
        })
        handleCloseModalEdit();
        // refetch tasks to update changes
        await fetchToDoTasks();
        await fetchInProgressTasks();
        await fetchCompletedTasks();
    }

    const deleteTask = async(task: any) => {
        await deleteDoc(doc(db, "tasks", task.id))
        if (task.completed === false && task.inProgress === false){
            await fetchToDoTasks();
        }
        if (task.completed === false && task.inProgress === true){
            await fetchInProgressTasks();
        } else {
            await fetchCompletedTasks();
        }
    }

    const touchSensor = useSensor(TouchSensor, {
        // Press delay of 250ms, with tolerance of 5px of movement
        activationConstraint: {
            delay: 250,
            tolerance: 5,
        },
    });

    const mouseSensor = useSensor(MouseSensor);
    const keyboardSensor = useSensor(KeyboardSensor);

    const sensors = useSensors( touchSensor, mouseSensor, keyboardSensor);

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        let newStatus = null;
        if (overId === "in-progress") {
            newStatus = { inProgress: true, completed: false };
        } else if (overId === "complete") {
            newStatus = { inProgress: false, completed: true };
        } else if (overId === "to-do") {
            newStatus = { inProgress: false, completed: false };
        } else {
            return;
        }

        const taskRef = doc(db, "tasks", activeId);
        await setDoc(taskRef, newStatus, { merge: true });

        await fetchToDoTasks();
        await fetchInProgressTasks();
        await fetchCompletedTasks();
    }

        return (
            <div className={styles.dashboard}>
                <DndContext onDragEnd={(event: any) => handleDragEnd(event)} sensors={sensors} collisionDetection={closestCorners} modifiers={[restrictToWindowEdges]}>
                    
                    <div className={styles.toDoTasks}>
                        <h1>To Do</h1>
                        <Droppable id='to-do'>
                            {toDoTasks.map((task) => (
                                <div key={task.id}>
                                    <Draggable task={task}>
                                        <h2>{task.title}</h2>
                                        <span>{task.createdBy}</span>
                                        <p>{task.content}</p>
                                        <button 
                                            className={styles.editButton} 
                                            onClick={() => handleOpenModalEdit(task)}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button 
                                            className={styles.deleteButton} 
                                            onClick={() => deleteTask(task)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </ Draggable >
                                </div> 
                            ))}
                        </Droppable>
                        <button 
                            className={styles.newTask}
                            onClick={handleOpenModalNew}
                        >
                            + New Task
                        </button>
                    </div>
                    <div className={styles.inProgressTasks}>
                        <h1>In Progress</h1>
                        <Droppable id='in-progress'>
                            {inProgressTasks.map((task) => (
                                <div key={task.id}>
                                    <Draggable task={task} >
                                        <h2>{task.title}</h2>
                                        <span>{task.createdBy}</span>
                                        <p>{task.content}</p>
                                        <button 
                                            className={styles.editButton} 
                                            onClick={() => handleOpenModalEdit(task)}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button 
                                            className={styles.deleteButton} 
                                            onClick={() => deleteTask(task)}
                                        >
                                            <FaTrash />
                                        </button>
                                        
                                    </ Draggable >
                                </div>
                            ))}
                        </Droppable>
                        <button 
                            className={styles.newTask}
                            onClick={handleOpenModalNew}
                        >
                            + New Task
                        </button>
                    </div>
                    <div className={styles.completedTasks}>
                        <h1>Completed</h1>
                        <Droppable id='complete'>
                            
                            {completedTasks.map((task) => (
                                <div key={task.id}>
                                    <Draggable task={task}>
                                        <h2>{task.title}</h2>
                                        <span>{task.createdBy}</span>
                                        <p>{task.content}</p>
                                        <button 
                                            className={styles.editButton} 
                                            onClick={() => handleOpenModalEdit(task)}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button 
                                            className={styles.deleteButton} 
                                            onClick={() => deleteTask(task)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </ Draggable > 
                                </div>
                            ))}
                        </Droppable>
                        <button 
                            className={styles.newTask}
                            onClick={handleOpenModalNew}
                        >
                            + New Task
                        </button>
                    </div>
                </DndContext>
                    {/* modal for new task */}
                <Modal show={showModalNew} onClose={handleCloseModalNew}>
                    <form className={styles.newTaskForm}>
                        <label>New Task</label>
                        <input 
                            className={styles.newTaskTitle}
                            type="text"
                            placeholder="Name your new task"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)} 
                        />
                        <input 
                            className={styles.newTaskContent}
                            type="text"
                            placeholder="Describe your new task" 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <button onClick={addNewTask}>Publish</button>
                    </form>
                </Modal>
                {/* modal for editing task */}
                <Modal show={showModalEdit} onClose={handleCloseModalEdit}>
                    <form className={styles.editTaskForm}>
                        <label>Edit Task</label>
                        <input 
                            className={styles.editTaskTitle}
                            type="text" 
                            placeholder={title}
                            value={updatedTitle}
                            onChange={(e) => setUpdatedTitle(e.target.value)}
                        />
                        <input 
                            className={styles.editTaskContent}
                            type="text" 
                            placeholder={content}
                            value={updatedContent}
                            onChange={(e) => setUpdatedContent(e.target.value)}
                        />
                        <button onClick={(event) => updateTask(event)}>Publish</button>
                    </form>
                </Modal>
            </div>
        )
    }