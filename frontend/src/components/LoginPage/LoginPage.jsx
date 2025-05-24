import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import styles from "./LoginPage.module.css";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');

    const result = await login(data.username, data.password);
    
    if (result.success) {
      navigate("/chat");
    } else {
      setApiError(result.error);
    }
    
    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h2 className={styles.title}>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Login to chat</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {apiError && (
            <div className={styles.error} style={{
              textAlign: 'center',
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              borderRadius: '6px'
            }}>
              {apiError}
            </div>
          )}
          
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className={styles.input}
              {...register("username", {
                required: "Username is required",
              })}
            />
            {errors.username && (
              <p className={styles.error}>{errors.username.message}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <p className={styles.error}>{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </button>

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