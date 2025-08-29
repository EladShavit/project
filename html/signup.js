document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const firstNameInput = document.getElementById('first_name');
    const lastNameInput = document.getElementById('last_name');
    const ageInput = document.getElementById('age');
    const submitButton = document.querySelector('button[type="submit"]');

    const errorMessages = {};
    const inputs = [emailInput, usernameInput, passwordInput, confirmPasswordInput, firstNameInput, lastNameInput, ageInput];
    
    inputs.forEach(input => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = 'red';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '-8px';
        errorDiv.style.marginBottom = '5px';
        errorDiv.style.display = 'none';
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
        errorMessages[input.id] = errorDiv;
    });

    function validateEmail(email) {
        if (!email) return 'Email is required';
        if (email.startsWith('@') || email.endsWith('@')) {
            return 'Email cannot start or end with @';
        }
        if (!email.includes('@')) {
            return 'Email must contain @ character';
        }
        const parts = email.split('@');
        if (parts.length !== 2) {
            return 'Email must contain exactly one @ character';
        }
        const domainPart = parts[1];
        if (!domainPart.includes('.')) {
            return 'Email domain must contain a period';
        }
        if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
            return 'Email domain cannot start or end with a period';
        }
        return '';
    }

    function validateUsername(username) {
        if (!username) return 'Username is required';
        if (username.length < 6) {
            return 'Username must be at least 6 characters long';
        }
        // Check if username already exists
        const users = JSON.parse(localStorage.getItem('users')) || {};
        if (users[username]) {
            return 'Username already exists. Please choose a different one';
        }
        return '';
    }

    function validatePassword(password) {
        if (!password) return 'Password is required';
        if (password.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        if (!/[a-zA-Z]/.test(password)) {
            return 'Password must contain at least one letter';
        }
        if (!/[0-9]/.test(password)) {
            return 'Password must contain at least one number';
        }
        return '';
    }

    function validateConfirmPassword(confirmPassword, password) {
        if (!confirmPassword) return 'Please confirm your password';
        if (confirmPassword !== password) {
            return 'Passwords do not match';
        }
        return '';
    }

    function validateFirstName(firstName) {
        if (!firstName) return 'First name is required';
        if (firstName.length < 2) {
            return 'First name must be at least 2 characters long';
        }
        if (!/^[a-zA-Z]+$/.test(firstName)) {
            return 'First name must contain only letters';
        }
        return '';
    }

    function validateLastName(lastName) {
        if (!lastName) return 'Last name is required';
        if (lastName.length < 2) {
            return 'Last name must be at least 2 characters long';
        }
        if (!/^[a-zA-Z]+$/.test(lastName)) {
            return 'Last name must contain only letters';
        }
        return '';
    }

    function validateAge(age) {
        if (!age) return 'Age is required';
        const ageNum = parseInt(age);
        if (isNaN(ageNum)) {
            return 'Age must be a valid number';
        }
        if (ageNum < 18 || ageNum > 65) {
            return 'Age must be between 18 and 65';
        }
        return '';
    }

    function showError(inputId, message) {
        const errorDiv = errorMessages[inputId];
        if (message) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        } else {
            errorDiv.style.display = 'none';
        }
    }

    emailInput.addEventListener('input', function() {
        const error = validateEmail(this.value);
        showError('email', error);
    });

    usernameInput.addEventListener('input', function() {
        const error = validateUsername(this.value);
        showError('username', error);
    });

    passwordInput.addEventListener('input', function() {
        const error = validatePassword(this.value);
        showError('password', error);
        if (confirmPasswordInput.value) {
            const confirmError = validateConfirmPassword(confirmPasswordInput.value, this.value);
            showError('confirm_password', confirmError);
        }
    });

    confirmPasswordInput.addEventListener('input', function() {
        const error = validateConfirmPassword(this.value, passwordInput.value);
        showError('confirm_password', error);
    });

    firstNameInput.addEventListener('input', function() {
        const error = validateFirstName(this.value);
        showError('first_name', error);
    });

    lastNameInput.addEventListener('input', function() {
        const error = validateLastName(this.value);
        showError('last_name', error);
    });

    ageInput.addEventListener('input', function() {
        const error = validateAge(this.value);
        showError('age', error);
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const emailError = validateEmail(emailInput.value);
        const usernameError = validateUsername(usernameInput.value);
        const passwordError = validatePassword(passwordInput.value);
        const confirmPasswordError = validateConfirmPassword(confirmPasswordInput.value, passwordInput.value);
        const firstNameError = validateFirstName(firstNameInput.value);
        const lastNameError = validateLastName(lastNameInput.value);
        const ageError = validateAge(ageInput.value);

        showError('email', emailError);
        showError('username', usernameError);
        showError('password', passwordError);
        showError('confirm_password', confirmPasswordError);
        showError('first_name', firstNameError);
        showError('last_name', lastNameError);
        showError('age', ageError);

        if (emailError || usernameError || passwordError || confirmPasswordError || 
            firstNameError || lastNameError || ageError) {
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || {};
        
        users[usernameInput.value] = {
            email: emailInput.value,
            password: passwordInput.value,
            firstName: firstNameInput.value,
            lastName: lastNameInput.value,
            age: parseInt(ageInput.value)
        };

        localStorage.setItem('users', JSON.stringify(users));

        form.reset();

        alert('Registration successful! Redirecting to login page...');
        window.location.href = 'login.html';
    });
});