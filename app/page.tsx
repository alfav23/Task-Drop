"use client";
import SideBar from "@/components/SideBar";
import styles from "./page.module.css";
import Dashboard from "@/components/Dashboard";
import { useAuth } from "@/context/AuthContext";
// import { auth } from "firebase-admin";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  const { loading } = useAuth();
  console.log(user);

  useEffect(() => {
    // Only redirect after auth has finished initializing
    if (!loading && !user || user === null) {
      router.push('/login');
    }
  }, []);

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
  
  
