import React from "react";
import { useForm } from "react-hook-form";
import styles from "./LoginPage.module.css";
import { Link } from "react-router-dom";

export const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Login to chat</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="username"
              className={styles.input}
              {...register("username", {
                required: true,
              
              })}
            />

          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              {...register("password", {
                required: true,
                minLength: {
                  value: 6,
                },
              })}
            />
            {errors.password && (
              <p className={styles.error}>{errors.password.message}</p>
            )}
          </div>
          <Link to="/chat">
            <button type="submit" className={styles.button}>
              Login
            </button>
          </Link>
          <p className={styles.registerPrompt}>
            Don't have an account?
            <Link to="/register" className={styles.registerLink}>
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
