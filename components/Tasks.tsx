"use client";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./../lib/firebaseConfig";
import React, { useEffect, useState } from "react";
import { DiVim } from "react-icons/di";


export default function Tasks(){
    const tasks = collection(db, "tasks");
        console.log(tasks);
        const tdQ = query(tasks, where("inProgress", "==", false), where("completed", "==", false));
        const [toDoTasks, setToDoTasks] = useState<any[]>([]);

        const fetchToDoTasks = async() => {
            const querySnapshot = await getDocs(tdQ);
            const todo = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setToDoTasks(todo);
        };

        useEffect(() => {
            fetchToDoTasks();
        }, []);

        return(
            <div>
                <h1>To Do</h1>
                <div>
                    {toDoTasks.map((task) => (
                        <div key={task.id}>
                            <h2>{task.title}</h2>
                            <span>{task.createdBy}</span>
                            <p>{task.content}</p>
                        </div>
                    ))}
                </div>
            </div>

                )
                
    }