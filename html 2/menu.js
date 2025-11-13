
const currentUser = localStorage.getItem('currentUser');

const userGreeting = document.querySelector('.user-greeting');
if (userGreeting) {
    if (!currentUser) {
        userGreeting.innerHTML = 'Hello Guest!';
    } else {
        userGreeting.innerHTML = `Hello ${currentUser}!`;
    }
}

const signoutLink = document.getElementById('signout-link');
if (signoutLink) {
    signoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        localStorage.removeItem('currentUser');
        console.log('User signed out'); 
        
        alert('You have been successfully signed out.');

        window.location.href = 'login.html';
    });
}

const shiftsLink = document.getElementById('shifts-link');
if (shiftsLink) {
    shiftsLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'homepage.html';
    });
}