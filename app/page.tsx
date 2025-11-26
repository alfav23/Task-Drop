"use client";
import styles from "./page.module.css";
import Dashboard from "@/components/Dashboard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Only redirect after auth has finished initializing
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // while redirecting, render nothing
    return null;
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Dashboard></Dashboard>
      </main>
    </div>
  );
}
