"use client";
import SideBar from "@/components/SideBar";
import styles from "./page.module.css";
import Dashboard from "@/components/Dashboard";
import { useAuth } from "@/context/AuthContext";
// import { auth } from "firebase-admin";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const auth = getAuth();
  const [ user, setUser ] = useState(auth.currentUser);
  const [ loading, setLoading ] = useState(true);
  console.log(user);

  useEffect(() => {
    onAuthStateChanged(auth, (activeUser) => {
      if (activeUser) {
        setUser(activeUser);
        console.log(user);
      } else {
        console.log("no active user")
      }
        setLoading(false);
    })
  }, [auth]);
  
  useEffect(() => {
    // Only redirect after auth has finished initializing
    if (!loading) {
      if (!user || user === null) {
        router.push('/login');
      }
    }
  }, [loading]);

  if (user){
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <SideBar></SideBar>
          <Dashboard></Dashboard>
        </main>
      </div>
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // while redirecting, render nothing
    return null;
  }
}

