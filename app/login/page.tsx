'use client';
import { useRouter } from "next/navigation";
import { useState } from "react"
import styles from "./login.module.scss";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from "next/link";
import { browserLocalPersistence, setPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '@/lib/firebaseConfig';
import Toast from "@/components/Toast/Toast";

const Login = () => {
    const router = useRouter()
    const [ showToast, setShowToast ] = useState<boolean>(false);
    const [ error, setError ] = useState<string | null>(null);
    const [ email, setEmail ] = useState<string>('');
    const [ password, setPassword ] = useState('');
    const [ showPassword, setShowPassword ] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }

    const handleLogIn = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        try { 
            setPersistence(auth, browserLocalPersistence)
            .then(() => {
                signInWithEmailAndPassword(auth, email, password);
                setShowToast(true);
                router.push('/');  
            })
            
        } catch (error) {
            setError('Failed to login. Please check your email and password.');
        }
    }

    return (
        <section className={styles.loginContainer}>
             <div className={styles.logoContainer}>
            </div>

            <h1 className={styles.title}>Log In</h1>
            
            <form className={styles.form} onSubmit={handleLogIn}>
                <input 
                    className={styles.input} 
                    type="email" 
                    value={email} 
                    placeholder="Username or email"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <div className={styles.passwordContainer}>
                    <input 
                        className={styles.input} 
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <span className={styles.toggleVisible} onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>

            <button className={styles.login} type="submit" disabled={ !email || !password }>Sign In</button> 

            <div className={styles.options}>
                    <Link href="/resetPassword">Forgot password? </Link>
                    <p>Don't have an account? <Link href="/signup">Sign up</Link></p>
            </div>
            {showToast && (
                <Toast
                    message="Successfully signed in"
                    onClose={() => setShowToast(false)}
                />
            )}
            </form>
            {
            error && 
                <div className={styles.error}>
                    {error}
                </div>}
        </section>
    )
}

export default Login;