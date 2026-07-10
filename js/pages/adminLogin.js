import { loginUser } from '../auth.js';
import { redirectIfLoggedIn } from '../auth-check.js';
import { showToast } from '../utils.js';

export default function renderAdminLogin() {
    redirectIfLoggedIn();

    const app = document.getElementById('app');
    app.innerHTML = `
    <div style="background: white; padding: 2.5rem; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 2rem;">
        <h1 style="color: #1a1a2e; font-size: 2rem; margin-bottom: 0.5rem;">🔐 Admin Login</h1>
        <p style="color: #6b7280;">Enter your credentials to access the admin panel</p>
      </div>
      
      <form id="loginForm">
        <div class="form-group">
          <label for="email" style="font-weight: 600; color: #1a1a2e;">Email Address</label>
          <input type="email" id="email" placeholder="admin@example.com" required style="
            width: 100%;
            padding: 0.8rem 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 1rem;
            transition: border-color 0.3s;
          ">
        </div>
        
        <div class="form-group">
          <label for="password" style="font-weight: 600; color: #1a1a2e;">Password</label>
          <input type="password" id="password" placeholder="Enter your password" required style="
            width: 100%;
            padding: 0.8rem 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 1rem;
            transition: border-color 0.3s;
          ">
        </div>
        
        <button type="submit" id="loginBtn" style="
          width: 100%;
          padding: 0.8rem;
          background: #4a6cf7;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 1rem;
        ">
          Login
        </button>
      </form>
      
      <div style="margin-top: 1.5rem; text-align: center; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
        <a href="../index.html" style="color: #6b7280; text-decoration: none; font-size: 0.9rem;">
          ← Back to Store
        </a>
      </div>
      
      <div id="errorMessage" style="
        margin-top: 1rem;
        padding: 0.8rem;
        background: #fee2e2;
        color: #991b1b;
        border-radius: 10px;
        display: none;
        font-size: 0.9rem;
        text-align: center;
      "></div>
    </div>
  `;

    // Handle form submission
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        const errorDiv = document.getElementById('errorMessage');

        // Hide any previous error
        errorDiv.style.display = 'none';

        // Validate inputs
        if (!email || !password) {
            errorDiv.textContent = 'Please enter both email and password';
            errorDiv.style.display = 'block';
            return;
        }

        // Show loading state
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
        loginBtn.style.opacity = '0.7';

        try {
            const result = await loginUser(email, password);

            if (result.success) {
                // Login successful - redirect to admin dashboard
                window.location.href = 'index.html';
            } else {
                // Login failed
                errorDiv.textContent = '❌ ' + result.error.replace('Firebase: ', '');
                errorDiv.style.display = 'block';

                // Reset button
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
                loginBtn.style.opacity = '1';
            }
        } catch (error) {
            errorDiv.textContent = '❌ An unexpected error occurred. Please try again.';
            errorDiv.style.display = 'block';

            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
            loginBtn.style.opacity = '1';
        }
    });

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
    #email:focus, #password:focus {
      outline: none;
      border-color: #4a6cf7;
      box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
    }
    #loginBtn:hover:not(:disabled) {
      background: #3a5cd5;
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(74, 108, 247, 0.3);
    }
    #loginBtn:disabled {
      cursor: not-allowed;
    }
  `;
    document.head.appendChild(style);
}