// Update shift functionality - Add new shifts for the logged-in user
// Wait for DOM to be ready since we need to access elements
const shiftForm = document.querySelector('form');
const dateInput = document.getElementById('date');
const startTimeInput = document.getElementById('starttime');
const finishTimeInput = document.getElementById('finishtime');
const hourlyWageInput = document.getElementById('hourlywage');
const positionInput = document.getElementById('position');
const branchInput = document.getElementById('branch');
const pageTitle = document.querySelector('.signup-form h1');
const submitButton = document.querySelector('button[type="submit"]');

// Initialize variables at the top
let isUpdating = false;
let currentShiftData = null;

// Check if user is logged in (currentUser is already declared in menu.js)
if (!currentUser) {
    alert('You must be logged in to add shifts.');
    window.location.href = 'login.html';
}

// Create error message element
const errorMessage = document.createElement('div');
errorMessage.style.color = 'red';
errorMessage.style.textAlign = 'center';
errorMessage.style.marginBottom = '10px';
errorMessage.style.display = 'none';
shiftForm.insertBefore(errorMessage, shiftForm.firstChild);

// Create success message element
const successMessage = document.createElement('div');
successMessage.style.color = 'green';
successMessage.style.textAlign = 'center';
successMessage.style.marginBottom = '10px';
successMessage.style.display = 'none';
shiftForm.insertBefore(successMessage, shiftForm.firstChild);

// Calculate total wage for a shift
function calculateShiftWage(startTime, finishTime, hourlyWage) {
    // Parse times
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [finishHour, finishMin] = finishTime.split(':').map(Number);
    
    // Calculate hours worked
    let totalMinutes = (finishHour * 60 + finishMin) - (startHour * 60 + startMin);
    
    // Handle overnight shifts
    if (totalMinutes < 0) {
        totalMinutes += 24 * 60; // Add 24 hours in minutes
    }
    
    const hoursWorked = totalMinutes / 60;
    return (hoursWorked * hourlyWage).toFixed(2);
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
}

// Show success message
function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
}

// Hide messages
function hideMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}

// Check if we're updating an existing shift
const shiftToUpdateId = localStorage.getItem('shiftToUpdate');

// Load shift data if updating
if (shiftToUpdateId) {
    console.log('Update mode - Shift ID:', shiftToUpdateId);
    isUpdating = true;
    
    // Get the shift data
    const allShifts = JSON.parse(localStorage.getItem('shifts')) || {};
    const userShifts = allShifts[currentUser] || [];
    currentShiftData = userShifts.find(shift => shift.id === shiftToUpdateId);
    
    console.log('Found shift data:', currentShiftData);
    
    if (currentShiftData) {
        // Populate form with existing shift data - check each element exists first
        if (dateInput) dateInput.value = currentShiftData.date;
        else console.error('dateInput not found');
        
        if (startTimeInput) startTimeInput.value = currentShiftData.startTime;
        else console.error('startTimeInput not found');
        
        if (finishTimeInput) finishTimeInput.value = currentShiftData.finishTime;
        else console.error('finishTimeInput not found');
        
        if (hourlyWageInput) hourlyWageInput.value = currentShiftData.hourlyWage;
        else console.error('hourlyWageInput not found');
        
        if (positionInput) positionInput.value = currentShiftData.position;
        else console.error('positionInput not found');
        
        if (branchInput) branchInput.value = currentShiftData.branch;
        else console.error('branchInput not found');
        
        // Update the page title and button text
        if (pageTitle) {
            pageTitle.textContent = 'Update Shift Details';
        }
        if (submitButton) {
            submitButton.textContent = 'Update';
        }
        
        console.log('Form populated with shift data');
    } else {
        console.log('Shift not found, clearing update flag');
        // Shift not found, clear the update flag
        localStorage.removeItem('shiftToUpdate');
        isUpdating = false;
    }
} else {
    console.log('Add mode - Creating new shift');
}

// Form submission
shiftForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Clear previous messages
    hideMessages();
    
    // Validate all fields are filled
    if (!dateInput.value) {
        showError('Please select a date');
        return;
    }
    
    if (!startTimeInput.value) {
        showError('Please enter start time');
        return;
    }
    
    if (!finishTimeInput.value) {
        showError('Please enter finish time');
        return;
    }
    
    if (!hourlyWageInput.value || hourlyWageInput.value <= 0) {
        showError('Please enter a valid hourly wage');
        return;
    }
    
    if (!positionInput.value.trim()) {
        showError('Please enter a position');
        return;
    }
    
    if (!branchInput.value) {
        showError('Please select a branch');
        return;
    }
    
    // Validate that finish time is after start time (for same day)
    if (startTimeInput.value >= finishTimeInput.value) {
        // This might be an overnight shift, which is allowed
        console.log('Note: This appears to be an overnight shift');
    }
    
    // Calculate total wage for this shift
    const totalWage = calculateShiftWage(
        startTimeInput.value,
        finishTimeInput.value,
        parseFloat(hourlyWageInput.value)
    );
    
    // Get existing shifts from localStorage
    const allShifts = JSON.parse(localStorage.getItem('shifts')) || {};
    
    // Initialize user's shifts array if it doesn't exist
    if (!allShifts[currentUser]) {
        allShifts[currentUser] = [];
    }
    
    if (isUpdating) {
        // Update existing shift
        const shiftIndex = allShifts[currentUser].findIndex(shift => shift.id === shiftToUpdateId);
        
        if (shiftIndex !== -1) {
            // Update the shift while keeping its ID and creation date
            allShifts[currentUser][shiftIndex] = {
                id: shiftToUpdateId,
                date: dateInput.value,
                startTime: startTimeInput.value,
                finishTime: finishTimeInput.value,
                hourlyWage: parseFloat(hourlyWageInput.value),
                position: positionInput.value.trim(),
                branch: branchInput.value,
                totalWage: parseFloat(totalWage),
                createdAt: currentShiftData.createdAt,
                updatedAt: new Date().toISOString()
            };
            
            // Save back to localStorage
            localStorage.setItem('shifts', JSON.stringify(allShifts));
            
            // Clear the update flag
            localStorage.removeItem('shiftToUpdate');
            
            // Show success message
            showSuccess('Shift updated successfully!');
            
            // Redirect to homepage after a delay
            setTimeout(() => {
                window.location.href = 'homepage.html';
            }, 1500);
        }
    } else {
        // Create new shift
        const newShift = {
            id: Date.now().toString(), // Unique ID using timestamp
            date: dateInput.value,
            startTime: startTimeInput.value,
            finishTime: finishTimeInput.value,
            hourlyWage: parseFloat(hourlyWageInput.value),
            position: positionInput.value.trim(),
            branch: branchInput.value,
            totalWage: parseFloat(totalWage),
            createdAt: new Date().toISOString()
        };
        
        // Add new shift to user's shifts
        allShifts[currentUser].push(newShift);
        
        // Save back to localStorage
        localStorage.setItem('shifts', JSON.stringify(allShifts));
        
        // Show success message
        showSuccess('Shift added successfully!');
        
        // Clear form
        shiftForm.reset();
        
        // Optionally redirect to homepage after a delay
        setTimeout(() => {
            if (confirm('Shift added! Would you like to view your shifts?')) {
                window.location.href = 'homepage.html';
            }
        }, 1000);
    }
});

// Clear messages when user starts typing
const allInputs = [dateInput, startTimeInput, finishTimeInput, hourlyWageInput, positionInput, branchInput];
allInputs.forEach(input => {
    if (input) {
        input.addEventListener('input', hideMessages);
        input.addEventListener('change', hideMessages);
    }
});

// Add cancel button functionality if in update mode
if (isUpdating) {
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.type = 'button';
    cancelBtn.style.backgroundColor = '#6c757d';
    cancelBtn.style.color = 'white';
    cancelBtn.style.border = 'none';
    cancelBtn.style.padding = '10px 20px';
    cancelBtn.style.borderRadius = '4px';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.style.fontSize = '16px';
    cancelBtn.style.marginTop = '10px';
    cancelBtn.style.marginLeft = '10px';
    
    cancelBtn.addEventListener('click', function() {
        localStorage.removeItem('shiftToUpdate');
        window.location.href = 'homepage.html';
    });
    
    // Add cancel button after submit button
    if (submitButton) {
        submitButton.parentNode.appendChild(cancelBtn);
    }
}