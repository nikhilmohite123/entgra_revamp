import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Mail, Lock, ChevronRight } from 'lucide-react';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 3D Tilt perspective state values
  const [tiltStyle, setTiltStyle] = useState({});
  const [isHovered, setIsHovered] = useState(false);

  // Handle direct sign-in logic
  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      setError('Enter username and password!');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const baseUrl = "http://192.168.1.3:9003";
      
      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ user: username, pass: password })
      }).catch(() => null);

      if (response && response.ok) {
        const data = await response.json();
        console.log("Login response:", data);

        // Check backend error
        if (data.errMess) {
          setError('Please Contact your Technical Person!');
          setLoading(false);
          return;
        }

        // New API response structure
        const user = data?.userData?.[0];
        console.log(user,"user")

        // Check user data
        if (!user || !user.S_EMAIL_ID) {
          setError('Invalid login credentials. Please check your username and password.');
          setLoading(false);
          return;
        }

        // Clear old session
        localStorage.clear();

        // Store user information
        localStorage.setItem("uid", user.S_EMAIL_ID);
        localStorage.setItem("empId", user.S_EMP_ID || "");
        localStorage.setItem("empName", user.S_EMP_NAME || "");
        localStorage.setItem("isAdmin", user.N_ISADMIN ?? 0);
        localStorage.setItem("dept", user.S_DEPT_NAME || "");
        localStorage.setItem("loc", user.s_location || "");
        localStorage.setItem("loginId", user.S_LOGIN_ID || "");
        localStorage.setItem("C_code", user.S_COMPANY_CODE || "");
        localStorage.setItem("grpId", user.N_GROUP_AUTO_ID || "");

        // Store complete authenticated user
        localStorage.setItem(
          "auth_user",
          JSON.stringify({
            username: user.S_EMP_NAME,
            role: user.N_ISADMIN ? "Administrator" : "User",
            email: user.S_EMAIL_ID
          })
        );

        navigate("/main", { replace: true });
        return;
      }

      console.warn("Backend API offline, falling back to mock login");
      const mockResponse = await authService.login(username, password);
      if (mockResponse.success) {
        localStorage.setItem('auth_user', JSON.stringify(mockResponse.user));
        navigate('/main', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid login. Please check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  // Interactive 3D Perspective Tilt on Mouse Movement
  const handleMouseMove = (e) => {
    if (window.innerWidth <= 767) return; // Disable on mobile to prevent layout jumps
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    // Rotate cards up to 9 degrees
    const rotateY = ((x - xc) / xc) * 9;
    const rotateX = -((y - yc) / yc) * 9;
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.025, 1.025, 1.025)`,
      transition: 'transform 0.08s ease-out'
    });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setTiltStyle({});
    setIsHovered(false);
  };

  // Expose legacy global signIn function for compatibility with any external script triggers
  useEffect(() => {
    window.signIn = () => {
      handleSignIn();
    };
    return () => {
      delete window.signIn;
    };
  }, [username, password]);

  // Adjust viewport height for mobile browsers
  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.loginMainContainer}>
      
      {/* Upper viewport area (Video on Left, Form on Right) */}
      <div className={styles.rowContainer}>
        
        {/* Interactive 3D Video Column */}
        <div 
          className={styles.videoCol}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            className={`${styles.videoWrapper} ${!isHovered ? styles.videoWrapperIdle : ''}`}
            style={tiltStyle}
          >
            <div className={styles.shineOverlay}></div>
            <video autoPlay muted loop playsInline className={styles.videoElement}>
              <source src="https://www.eplglobal.com/wp-content/uploads/2024/08/product_video.mp4" type="video/mp4" />
              <source src="../bpmn/img/product_video.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        {/* Login Form Column */}
        <div className={styles.formCol}>
          <div className={styles.loginBox}>
            
            {/* Logo */}
            <div className={styles.logoContainer}>
              <img 
                src="https://www.eplglobal.com/wp-content/uploads/2024/06/main_logo.svg" 
                alt="Logo" 
                className={styles.logo} 
              />
            </div>

            {/* Error Message */}
            {error && <div className={styles.errorMsg}>{error}</div>}

            {/* Form */}
            <form onSubmit={handleSignIn}>
              
              {/* Username field */}
              <div className={styles.fieldContainer}>
                <span className={styles.fieldIcon}>
                  <Mail size={18} />
                </span>
                <input 
                  type="text" 
                  className={styles.fieldInput} 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  autoComplete="off"
                />
              </div>

              {/* Password field */}
              <div className={styles.fieldContainer}>
                <span className={styles.fieldIcon}>
                  <Lock size={18} />
                </span>
                <input 
                  type="password" 
                  className={styles.fieldInput} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  required
                />
              </div>

              {/* Submit button - uses gradient representing brand colors */}
              <button 
                type="submit" 
                disabled={loading}
                className={styles.submitButton}
              >
                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                <ChevronRight size={18} />
              </button>

            </form>

            <div style={{ marginTop: '1.25rem', padding: '0.75rem', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              System credentials: <code style={{ fontWeight: 'bold' }}>admin</code> / <code style={{ fontWeight: 'bold' }}>admin123</code>
            </div>

          </div>
        </div>

      </div>

      {/* Footer Area */}
      <footer className={styles.footerElement}>
        <div className={styles.footerRow}>
          <div className={styles.footerTextLeft}>
            Support and maintain by <i><a href="https://kosqu.com/" target="_blank" rel="noreferrer">KOSQU TechnoLab</a></i>
          </div>
          <div className={styles.footerTextRight}>
            Powered by <a href="/bpmn">EPL Entgra BPMN</a> <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>v2.1.1</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
