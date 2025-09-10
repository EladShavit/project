let isUpdating = false;
let currentShiftData = null;

function initializePage() {
    const shiftForm = document.querySelector('form');
    const dateInput = document.getElementById('date');
    const startTimeInput = document.getElementById('starttime');
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

    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    if (!currentUser) {
        alert('You must be logged in to add shifts.');
        window.location.href = 'login.html';
        return;
    }

    function calculateShiftWage(startTime, finishTime, hourlyWage) {
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [finishHour, finishMin] = finishTime.split(':').map(Number);
        
        let startMinutes = startHour * 60 + startMin;
        let finishMinutes = finishHour * 60 + finishMin;
        
        let totalMinutes;
        if (finishMinutes <= startMinutes) {
            totalMinutes = (24 * 60 - startMinutes) + finishMinutes;
        } else {
            totalMinutes = finishMinutes - startMinutes;
        }
        
        const hoursWorked = totalMinutes / 60;
        return (hoursWorked * hourlyWage).toFixed(2);
    }

    function checkShiftOverlap(date, startTime, finishTime, excludeShiftId = null) {
        const allShifts = JSON.parse(localStorage.getItem('shifts')) || {};
        const userShifts = allShifts[currentUser] || [];
        
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [finishHour, finishMin] = finishTime.split(':').map(Number);
        let newStartMinutes = startHour * 60 + startMin;
        let newFinishMinutes = finishHour * 60 + finishMin;
        
        const isOvernightNew = newFinishMinutes <= newStartMinutes;
        if (isOvernightNew) {
            newFinishMinutes += 24 * 60; 
        }
        
        for (const shift of userShifts) {
            if (excludeShiftId && shift.id === excludeShiftId) continue;
            
            if (shift.date === date) {
                const [existingStartHour, existingStartMin] = shift.startTime.split(':').map(Number);
                const [existingFinishHour, existingFinishMin] = shift.finishTime.split(':').map(Number);
                let existingStartMinutes = existingStartHour * 60 + existingStartMin;
                let existingFinishMinutes = existingFinishHour * 60 + existingFinishMin;
                
                const isOvernightExisting = existingFinishMinutes <= existingStartMinutes;
                if (isOvernightExisting) {
                    existingFinishMinutes += 24 * 60;
                }
                
                if ((newStartMinutes < existingFinishMinutes && newFinishMinutes > existingStartMinutes)) {
                    return {
                        hasOverlap: true,
                        conflictingShift: shift
                    };
                }
            }
        }
        
        return { hasOverlap: false };
    }

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
        if (successMessage) {
            successMessage.style.display = 'none';
        }
    }

    function showSuccess(message) {
        if (successMessage) {
            successMessage.textContent = message;
            successMessage.style.display = 'block';
        }
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    }

    function hideMessages() {
        if (errorMessage) {
            errorMessage.style.display = 'none';
            errorMessage.textContent = '';
        }
        if (successMessage) {
            successMessage.style.display = 'none';
            successMessage.textContent = '';
        }
    }

    const shiftToUpdateId = localStorage.getItem('shiftToUpdate');

    if (shiftToUpdateId) {
        isUpdating = true;
        
        const allShifts = JSON.parse(localStorage.getItem('shifts')) || {};
        const userShifts = allShifts[currentUser] || [];
        currentShiftData = userShifts.find(shift => shift.id === shiftToUpdateId);
        
        console.log('Found shift data:', currentShiftData);
        
        if (currentShiftData) {
            if (dateInput) dateInput.value = currentShiftData.date;
            if (startTimeInput) startTimeInput.value = currentShiftData.startTime;
            if (finishTimeInput) finishTimeInput.value = currentShiftData.finishTime;
            if (hourlyWageInput) hourlyWageInput.value = currentShiftData.hourlyWage;
            if (positionInput) positionInput.value = currentShiftData.position;
            if (branchInput) branchInput.value = currentShiftData.branch;
            
            if (pageTitle) {
                pageTitle.textContent = 'Update Shift Details';
            }
            if (submitButton) {
                submitButton.textContent = 'Update';
            }
            
        } else {
            localStorage.removeItem('shiftToUpdate');
            isUpdating = false;
        }
    } else {
        console.log('Add mode - Creating new shift');
    }

    shiftForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        hideMessages();
        
        if (!dateInput || !dateInput.value) {
            showError('Please select a date');
            return;
        }
        
        if (!startTimeInput || !startTimeInput.value) {
            showError('Please enter start time');
            return;
        }
        
        if (!finishTimeInput || !finishTimeInput.value) {
            showError('Please enter finish time');
            return;
        }
        
        if (!hourlyWageInput || !hourlyWageInput.value) {
            showError('Please enter an hourly wage');
            return;
        }
        
        const hourlyWage = parseFloat(hourlyWageInput.value);
        if (isNaN(hourlyWage) || hourlyWage <= 0) {
            showError('Hourly wage must be a positive number');
            return;
        }
        
        if (!positionInput || !positionInput.value.trim()) {
            showError('Please enter a position');
            return;
        }
        
        if (positionInput.value.trim().length < 1) {
            showError('Position must contain at least 1 character');
            return;
        }
        
        if (!branchInput || !branchInput.value) {
            showError('Please select a branch');
            return;
        }
        
        const overlapCheck = checkShiftOverlap(
            dateInput.value,
            startTimeInput.value,
            finishTimeInput.value,
            isUpdating ? shiftToUpdateId : null
        );
        
        if (overlapCheck.hasOverlap) {
            const conflict = overlapCheck.conflictingShift;
            showError(`You already have a shift on ${dateInput.value} from ${conflict.startTime} to ${conflict.finishTime}. Shifts cannot overlap.`);
            return;
        }
        
        if (startTimeInput.value >= finishTimeInput.value) {
            const totalWagePreview = calculateShiftWage(
                startTimeInput.value,
                finishTimeInput.value,
                parseFloat(hourlyWageInput.value)
            );
            console.log(`Overnight shift: ${startTimeInput.value} to ${finishTimeInput.value} (next day), Total wage: $${totalWagePreview}`);
        }
        
        const totalWage = calculateShiftWage(
            startTimeInput.value,
            finishTimeInput.value,
            parseFloat(hourlyWageInput.value)
        );
        
        const allShifts = JSON.parse(localStorage.getItem('shifts')) || {};
        
        if (!allShifts[currentUser]) {
            allShifts[currentUser] = [];
        }
        
        if (isUpdating) {
            const shiftIndex = allShifts[currentUser].findIndex(shift => shift.id === shiftToUpdateId);
            
            if (shiftIndex !== -1) {
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
                
                localStorage.setItem('shifts', JSON.stringify(allShifts));
                
                localStorage.removeItem('shiftToUpdate');
                
                showSuccess('Shift updated successfully!');
                
                setTimeout(() => {
                    window.location.href = 'homepage.html';
                }, 1500);
            }
        } else {
            const newShift = {
                id: Date.now().toString(),
                date: dateInput.value,
                startTime: startTimeInput.value,
                finishTime: finishTimeInput.value,
                hourlyWage: parseFloat(hourlyWageInput.value),
                position: positionInput.value.trim(),
                branch: branchInput.value,
                totalWage: parseFloat(totalWage),
                createdAt: new Date().toISOString()
            };
            
            allShifts[currentUser].push(newShift);
            
            localStorage.setItem('shifts', JSON.stringify(allShifts));
            
            showSuccess('Shift added successfully!');
            
            shiftForm.reset();
            
            setTimeout(() => {
                if (confirm('Would you like to view your shifts?')) {
                    window.location.href = 'homepage.html';
                }
            }, 1500);
        }
    });

    const allInputs = [dateInput, startTimeInput, finishTimeInput, hourlyWageInput, positionInput, branchInput];
    allInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', hideMessages);
            input.addEventListener('change', hideMessages);
        }
    });

    if (isUpdating) {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.width = '100%';
        buttonContainer.style.marginTop = '10px';
        
        const submitParent = submitButton.parentNode;
        submitParent.removeChild(submitButton);
        
        submitButton.style.cssText = '';
        submitButton.style.flex = '1';
        submitButton.style.padding = '10px 20px';
        submitButton.style.fontSize = '16px';
        submitButton.style.border = 'none';
        submitButton.style.borderRadius = '4px';
        submitButton.style.cursor = 'pointer';
        submitButton.style.backgroundColor = '#007bff';
        submitButton.style.color = 'white';
        submitButton.style.minHeight = '44px';  
        submitButton.style.fontWeight = 'normal';
        submitButton.style.margin = '0';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.type = 'button';
        cancelBtn.style.flex = '1';
        cancelBtn.style.padding = '10px 20px';
        cancelBtn.style.fontSize = '16px';
        cancelBtn.style.border = 'none';
        cancelBtn.style.borderRadius = '4px';
        cancelBtn.style.cursor = 'pointer';
        cancelBtn.style.backgroundColor = '#6c757d';
        cancelBtn.style.color = 'white';
        cancelBtn.style.minHeight = '44px';  
        cancelBtn.style.fontWeight = 'normal';
        cancelBtn.style.margin = '0';
        
        cancelBtn.addEventListener('click', function() {
            localStorage.removeItem('shiftToUpdate');
            window.location.href = 'homepage.html';
        });
        
        submitButton.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#0056b3';
        });
        submitButton.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#007bff';
        });
        
        cancelBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#545b62';
        });
        cancelBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#6c757d';
        });
        
        buttonContainer.appendChild(submitButton);
        buttonContainer.appendChild(cancelBtn);
        
        submitParent.appendChild(buttonContainer);
    }
}

setTimeout(() => {
    initializePage();
}, 0);