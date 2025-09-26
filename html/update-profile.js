const updateForm = document.querySelector('form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm_password');
const firstNameInput = document.getElementById('first_name');
const lastNameInput = document.getElementById('last_name');
const ageInput = document.getElementById('age');
const submitButton = document.querySelector('button[type="submit"]');

const errorMessages = {};
const inputs = [emailInput, passwordInput, confirmPasswordInput, firstNameInput, lastNameInput, ageInput];

if (!currentUser) {
    alert('Please login to update your profile');
    window.location.href = 'login.html';
}

function initializePage() {
    console.log('Loading profile for user:', currentUser);
    
    createErrorMessages();
    
    loadUserProfile();
    
    setupValidation();
    
    setupFormSubmission();
}

function createErrorMessages() {
    inputs.forEach(input => {
        if (input) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.color = 'red';
            errorDiv.style.fontSize = '12px';
            errorDiv.style.marginTop = '-8px';
            errorDiv.style.marginBottom = '5px';
            errorDiv.style.display = 'none';
            input.parentNode.insertBefore(errorDiv, input.nextSibling);
            errorMessages[input.id] = errorDiv;
        }
    });
}

function loadUserProfile() {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const userData = users[currentUser];
    
    if (userData) {
        emailInput.value = userData.email || '';
        firstNameInput.value = userData.firstName || '';
        lastNameInput.value = userData.lastName || '';
        ageInput.value = userData.age || '';
        
        passwordInput.value = '';
        confirmPasswordInput.value = '';
    }
    
    const usernameDisplay = document.createElement('div');
    usernameDisplay.style.marginBottom = '15px';
    usernameDisplay.style.padding = '10px';
    usernameDisplay.style.backgroundColor = '#f0f0f0';
    usernameDisplay.style.borderRadius = '4px';
    usernameDisplay.innerHTML = `<strong>Username:</strong> ${currentUser} <em style="color: #666;">(cannot be changed)</em>`;
    
    const updateFormDiv = document.querySelector('.update-form');
    const h1 = updateFormDiv.querySelector('h1');
    h1.insertAdjacentElement('afterend', usernameDisplay);
}

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

function validatePassword(password) {
    if (!password) return ''; 
    
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
    if (!password && !confirmPassword) return '';
    
    if (password && !confirmPassword) {
        return 'Please confirm your new password';
    }
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

function setupValidation() {
    emailInput.addEventListener('input', function() {
        const error = validateEmail(this.value);
        showError('email', error);
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
}

function setupFormSubmission() {
    updateForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const emailError = validateEmail(emailInput.value);
        const passwordError = validatePassword(passwordInput.value);
        const confirmPasswordError = validateConfirmPassword(confirmPasswordInput.value, passwordInput.value);
        const firstNameError = validateFirstName(firstNameInput.value);
        const lastNameError = validateLastName(lastNameInput.value);
        const ageError = validateAge(ageInput.value);

        showError('email', emailError);
        showError('password', passwordError);
        showError('confirm_password', confirmPasswordError);
        showError('first_name', firstNameError);
        showError('last_name', lastNameError);
        showError('age', ageError);

        if (emailError || passwordError || confirmPasswordError || 
            firstNameError || lastNameError || ageError) {
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || {};
        
        const existingUserData = users[currentUser] || {};
        
        users[currentUser] = {
            email: emailInput.value,
            password: passwordInput.value || existingUserData.password,
            firstName: firstNameInput.value,
            lastName: lastNameInput.value,
            age: parseInt(ageInput.value)
        };

        localStorage.setItem('users', JSON.stringify(users));

        const successMessage = document.createElement('div');
        successMessage.style.color = 'green';
        successMessage.style.textAlign = 'center';
        successMessage.style.marginTop = '10px';
        successMessage.style.padding = '10px';
        successMessage.style.backgroundColor = '#e6ffe6';
        successMessage.style.borderRadius = '4px';
        successMessage.textContent = 'Profile updated successfully!';
        
        const existingSuccess = updateForm.querySelector('.success-message');
        if (existingSuccess) {
            existingSuccess.remove();
        }
        
        successMessage.className = 'success-message';
        submitButton.parentNode.appendChild(successMessage);
        
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        
        setTimeout(() => {
            if (successMessage) {
                successMessage.remove();
            }
        }, 3000);
    });
}

initializePage();