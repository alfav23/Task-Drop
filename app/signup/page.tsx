'use client';
// will use state and hooks
import styles from "./signup.module.scss";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export const SignUpPage = () => {
    // sign up state
    const [ fullName, setFullName ] = useState('');
    const [ userName, setUserName ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ email, setEmail ] = useState('');

    const [ error, setError ] = useState('');
    const [ success, setSuccess ] = useState('');
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const router = useRouter()

    // regex for further password validation
    const validateForm = ():Boolean => {
        if (!email || !password || !fullName || !userName) {
            setError('All fields are required')
        }
        if (password.length < 6 ) {
            setError('Password must be at least 6 characters long');
        }
        setError("")
        return true;
    }

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();
        if(!validateForm()) return;

        setIsSubmitting(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            // update user display name
            await updateProfile(user, {
                displayName: fullName
            });

            // save username and additional info
            await setDoc(doc(db, "users", user.uid), {
                fullName, 
                userName,
                email: user.email,
                createdAt: new Date(),
                photoURL: "https://picsum.photos/50"
            });

            setSuccess("Account created successfully! Redirecting...");
            setTimeout(() => {
                router.push("/login");
            }, 2000); //redirect after 2 seconds
        } catch (error: any) {
            if (error.code === "auth/email-already-in-use") {
                setError("An account with this email already exists.")
            } else {
                setError("Failed to create an account. Please try again");
            }
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return(
        <section className={styles.signupContainer}>
            <h1 className={styles.title}>mywatchlists sign up</h1>
            <form onSubmit={handleSignUp} className={styles.form}>
                <input className={styles.input} type="text" placeholder="Full Name" value={fullName} onChange={(event) => setFullName(event.target.value) }/>

                <input className={styles.input} type="text" placeholder="Username" value={userName} onChange={(event) => setUserName(event.target.value) }/>

                <input className={styles.input} type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value) }/>

                <input className={styles.input} type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value) }/>

                {error && <p className={styles.error}>{error}</p>}

                {success && <p className={styles.success}>{success}</p>}

                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                    {isSubmitting ? "Signing up..." : 'Create account'}
                </button>

                <Link className={styles.goToLogin} href="/login">Already have an account</Link>
            </form>
        </section>
    );
}

export default SignUpPage;