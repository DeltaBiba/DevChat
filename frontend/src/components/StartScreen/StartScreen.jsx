import styles from "./StartScreen.module.css"
export const StartScreen = () => {
    return (
        <><div className={styles.container}>
            <div className={styles.greetings}>
                <h2>Hello</h2>
                <button>
                    Get started
                </button>
            </div>
            <div className={styles.sign}>
            <h2>Devchat</h2>
            <h3>Illia Buliekha, Danylo Bibaiev</h3>
            </div>
        </div>
        </>
    )
}
