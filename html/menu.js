// Menu functionality - Display current user and handle signout
// This script should be included in all pages with the sidebar menu

// Get the current user from localStorage
const currentUser = localStorage.getItem('currentUser');

// Update the user greeting
const userGreeting = document.querySelector('.user-greeting');
if (userGreeting) {
    if (!currentUser) {
        // If no user is logged in, display "Hello Guest!"
        userGreeting.innerHTML = 'Hello Guest!';
    } else {
        // Display the username
        userGreeting.innerHTML = `Hello ${currentUser}!`;
    }
}

// Handle signout using ID
const signoutLink = document.getElementById('signout-link');
if (signoutLink) {
    signoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Signout clicked'); // Debug log
        
        // Remove current user from localStorage
        localStorage.removeItem('currentUser');
        console.log('User signed out'); // Debug log
        
        // Show message
        alert('You have been successfully signed out.');
        
        // Redirect to login page
        window.location.href = 'login.html';
    });
}

// Handle Shifts link using ID
const shiftsLink = document.getElementById('shifts-link');
if (shiftsLink) {
    shiftsLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'homepage.html';
    });
}