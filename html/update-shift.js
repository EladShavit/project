// Update shift functionality - Add new shifts for the logged-in user
// Initialize variables at the top
let isUpdating = false;
let currentShiftData = null;

// Function to initialize the page
function initializePage() {
    // Get all form elements
    const shiftForm = document.querySelector('form');
    const dateInput = document.getElementById('date');
    const startTimeInput = document.getElementById('starttime');
    // Try different selectors for problematic elements
    const finishTimeInput = document.getElementById('finishtime') || 
                           document.querySelector('input[name="finishtime"]') ||
                           document.querySelector('input[type="time"]:nth-of-type(2)');
    const hourlyWageInput = document.getElementById('hourlywage') || 
                           document.querySelector('input[name="hourlywage"]') ||
                           document.querySelector('input[type="number"]');
    const positionInput = document.getElementById('position');
    const branchInput = document.getElementById('branch');
    const pageTitle = document.querySelector('.signup-form h1');
    const submitButton = document.querySelector('button[type="submit"]');

    // Debug: Check which elements are found
    console.log('Form elements check:', {
        dateInput: !!dateInput,
        startTimeInput: !!startTimeInput,
        finishTimeInput: !!finishTimeInput,
        hourlyWageInput: !!hourlyWageInput,
        positionInput: !!positionInput,
        branchInput: !!branchInput
    });

    // Check if user is logged in (currentUser is already declared in menu.js)
    if (!currentUser) {
        alert('You must be logged in to add shifts.');
        window.location.href = 'login.html';
        return;
    }

    // Calculate total wage for a shift
    function calculateShiftWage(startTime, finishTime, hourlyWage) {
        // Parse times
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [finishHour, finishMin] = finishTime.split(':').map(Number);
        
        // Calculate total minutes
        let startMinutes = startHour * 60 + startMin;
        let finishMinutes = finishHour * 60 + finishMin;
        
        let totalMinutes;
        if (finishMinutes <= startMinutes) {
            // Overnight shift - ends next day
            totalMinutes = (24 * 60 - startMinutes) + finishMinutes;
            console.log('Overnight shift detected');
        } else {
            // Same day shift
            totalMinutes = finishMinutes - startMinutes;
        }
        
        const hoursWorked = totalMinutes / 60;
        return (hoursWorked * hourlyWage).toFixed(2);
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
            // Populate form with existing shift data
            if (dateInput) dateInput.value = currentShiftData.date;
            if (startTimeInput) startTimeInput.value = currentShiftData.startTime;
            if (finishTimeInput) finishTimeInput.value = currentShiftData.finishTime;
            if (hourlyWageInput) hourlyWageInput.value = currentShiftData.hourlyWage;
            if (positionInput) positionInput.value = currentShiftData.position;
            if (branchInput) branchInput.value = currentShiftData.branch;
            
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
        
        // Validate all fields are filled
        if (!dateInput || !dateInput.value) {
            alert('Please select a date');
            return;
        }
        
        if (!startTimeInput || !startTimeInput.value) {
            alert('Please enter start time');
            return;
        }
        
        if (!finishTimeInput || !finishTimeInput.value) {
            alert('Please enter finish time');
            return;
        }
        
        if (!hourlyWageInput || !hourlyWageInput.value) {
            alert('Please enter an hourly wage');
            return;
        }
        
        const hourlyWage = parseFloat(hourlyWageInput.value);
        if (isNaN(hourlyWage) || hourlyWage <= 0) {
            alert('Hourly wage must be a positive number');
            return;
        }
        
        if (!positionInput || !positionInput.value.trim()) {
            alert('Please enter a position');
            return;
        }
        
        if (positionInput.value.trim().length < 1) {
            alert('Position must contain at least 1 character');
            return;
        }
        
        if (!branchInput || !branchInput.value) {
            alert('Please select a branch');
            return;
        }
        
        // Check if it's an overnight shift and provide information
        if (startTimeInput.value >= finishTimeInput.value) {
            // This is an overnight shift
            const totalWagePreview = calculateShiftWage(
                startTimeInput.value,
                finishTimeInput.value,
                parseFloat(hourlyWageInput.value)
            );
            console.log(`Overnight shift: ${startTimeInput.value} to ${finishTimeInput.value} (next day), Total wage: $${totalWagePreview}`);
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
                alert('Shift updated successfully!');
                
                // Redirect to homepage
                window.location.href = 'homepage.html';
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
            alert('Shift added successfully!');
            
            // Clear form
            shiftForm.reset();
            
            // Redirect to homepage
            setTimeout(() => {
                if (confirm('Would you like to view your shifts?')) {
                    window.location.href = 'homepage.html';
                }
            }, 100);
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
}

// Initialize the page when DOM is ready
// Use setTimeout to ensure all elements are loaded
setTimeout(() => {
    initializePage();
}, 0);