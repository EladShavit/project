const loginForm = document.querySelector('form');
const loginFormDiv = document.querySelector('.login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

const errorMessage = document.createElement('p');
errorMessage.style.color = 'red';
errorMessage.style.textAlign = 'center';
errorMessage.style.marginTop = '10px';
errorMessage.style.marginBottom = '10px';
errorMessage.style.display = 'none';
errorMessage.style.fontSize = '14px';

const flexBreak = loginFormDiv.querySelector('div[style*="flex-basis"]');
loginFormDiv.insertBefore(errorMessage, flexBreak);

loginForm.addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    hideError();

    if (!username) {
        showError('Please enter a username');
        return;
    }
    
    if (!password) {
        showError('Please enter a password');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || {};
    
    if (!users[username]) {
        showError('User does not exist. Please check your username or register first.');
        return;
    }
    
    if (users[username].password !== password) {
        showError('Incorrect password. Please try again.');
        return;
    }
    
    localStorage.setItem('currentUser', username);

    window.location.href = 'homepage.html';
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';

    usernameInput.value = '';
    passwordInput.value = '';

    usernameInput.focus();
}

function hideError() {
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
}

usernameInput.addEventListener('input', hideError);
passwordInput.addEventListener('input', hideError);