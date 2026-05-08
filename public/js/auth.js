let isLogin = true;

const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authBtn = document.getElementById('authBtn');
const switchText = document.getElementById('authSwitchText');
const errorDiv = document.getElementById('authError');

function handleToggle() {
    isLogin = !isLogin;
    if (isLogin) {
        authTitle.innerText = 'Welcome to ShadowPrice';
        authBtn.innerText = 'Login';
        switchText.innerHTML = `Don't have an account? <span id="toggleAuth">Sign Up</span>`;
    } else {
        authTitle.innerText = 'Create an Account';
        authBtn.innerText = 'Sign Up';
        switchText.innerHTML = `Already have an account? <span id="toggleAuth">Login</span>`;
    }
    errorDiv.style.display = 'none';
    
    // Re-attach event listener
    document.getElementById('toggleAuth').addEventListener('click', handleToggle);
}

document.getElementById('toggleAuth').addEventListener('click', handleToggle);

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.style.display = 'none';
    authBtn.innerText = 'Processing...';

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Authentication failed');
        }

        // Redirect to dashboard
        window.location.href = '/dashboard';
    } catch (err) {
        errorDiv.innerText = err.message;
        errorDiv.style.display = 'block';
        authBtn.innerText = isLogin ? 'Login' : 'Sign Up';
    }
});
