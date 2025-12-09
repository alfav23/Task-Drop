'use client'
import { collection, where, query, getDocs } from "firebase/firestore";
import styles from "./SideBar.module.scss";
import { useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { getAuth, signOut } from "firebase/auth";
import { FaSearch, FaArrowAltCircleLeft, FaArrowAltCircleRight, FaRegUserCircle } from "react-icons/fa";

export default function Sidebar() {
    const auth = getAuth();
    const user = auth.currentUser;
    const [ searchParameter, setSearchParameter ] = useState<string>('');
    const [ results, setResults ] = useState<any[]>([]);
    const [ toggleVisible, setToggleVisible ] = useState(true);

    const executeSearch = async(event: React.FormEvent) => {
        event.preventDefault();
        const tasks = collection(db, "tasks")
        const q = query(tasks, where("title", "==", searchParameter), where("createdBy", "==", user?.displayName))
        const querySnapshot = await getDocs(q);
        const searchResults = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setResults(searchResults);
    }

    const setVisibility = () => {
        if(toggleVisible === true) {
            setToggleVisible(false);
        } else {
            setToggleVisible(true);
        }
    }

    const logoutUser = () => {
        signOut(auth);
    }

    return(
        <div className={styles.sideBarContainer} >
            <div className={styles.toggleSideBar} role="button"
                onClick={setVisibility}>
                { toggleVisible ? <FaArrowAltCircleLeft /> : <FaArrowAltCircleRight /> }
            </div>
            <div className={styles.sideBar} style={!toggleVisible ? {display: 'none'} : {display: 'flex'}}>

                <div className={styles.searchContainer}>
                    <form className={styles.searchForm}>
                        <input 
                            className={styles.searchInput}
                            type="text" 
                            placeholder="Search"
                            value={searchParameter}
                            onChange={(event) => setSearchParameter(event.target.value)}
                        />
                        <ul className={styles.searchResults}>
                            {results.map((result: any) => (
                                <li className={styles.result} key={result.id}>
                                    {result.title}
                                </li>
                            ))}
                        </ul>
                        <button 
                            onClick={executeSearch}
                            className={styles.searchSubmit}
                        >
                            <FaSearch />
                        </button>
                    </form>
                </div>

                <nav className={styles.sideBarNav}>
                    <a className={styles.navItem} href="/">Projects</a>
                    <a className={styles.navItem} href="/">New Project</a>
                    <a className={styles.navItem} onClick={logoutUser} href="/">Logout</a>
                </nav>

                <div className={styles.currentUser}>
                    <FaRegUserCircle />
                    {user?.displayName}
                </div>

            </div>
        </div>
    )
}
