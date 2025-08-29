// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    const loginFormDiv = document.querySelector('.login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    // Create error message element
    const errorMessage = document.createElement('p');
    errorMessage.style.color = 'red';
    errorMessage.style.textAlign = 'center';
    errorMessage.style.marginTop = '10px';
    errorMessage.style.marginBottom = '10px';
    errorMessage.style.display = 'none';
    errorMessage.style.fontSize = '14px';
    
    // Insert error message after the password input but before the buttons
    const flexBreak = loginFormDiv.querySelector('div[style*="flex-basis"]');
    loginFormDiv.insertBefore(errorMessage, flexBreak);
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default form submission
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Clear previous error message
        hideError();
        
        // Validate input fields
        if (!username) {
            showError('Please enter a username');
            return;
        }
        
        if (!password) {
            showError('Please enter a password');
            return;
        }
        
        // Check if user exists in localStorage
        const users = JSON.parse(localStorage.getItem('users')) || {};
        
        if (!users[username]) {
            showError('User does not exist. Please check your username or register first.');
            return;
        }
        
        // Check if password is correct
        if (users[username].password !== password) {
            showError('Incorrect password. Please try again.');
            return;
        }
        
        // Login successful
        // Store current logged in user
        localStorage.setItem('currentUser', username);
        
        // Redirect to homepage
        window.location.href = 'homepage.html';
    });
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Clear input fields on error
        usernameInput.value = '';
        passwordInput.value = '';
        
        // Focus back to username field
        usernameInput.focus();
    }
    
    function hideError() {
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    }
    
    // Hide error message when user starts typing
    usernameInput.addEventListener('input', hideError);
    passwordInput.addEventListener('input', hideError);
});