const shiftsTable = document.querySelector('.shifts-table');
const filterForm = document.querySelector('.filter-form');
const branchSelect = document.getElementById('branch-filter');
const positionInput = document.getElementById('job_position');
const totalWageDisplay = document.querySelector('p');

let userShifts = [];

function initializePage() {
    console.log('Initializing homepage...');
    
    console.log('Elements check:', {
        shiftsTable: !!shiftsTable,
        filterForm: !!filterForm,
        branchSelect: !!branchSelect,
        positionInput: !!positionInput
    });
    
    loadShifts();
    
    setupFilters();
}

function loadShifts() {
    console.log('Loading shifts for user:', currentUser);
    
    while (shiftsTable.rows.length > 1) {
        shiftsTable.deleteRow(1);
    }
    
    if (!currentUser) {
        displayNoShiftsMessage('Please login to view your shifts');
        updateTotalWage(0);
        return;
    }
    
    const allShifts = JSON.parse(localStorage.getItem('shifts')) || {};
    console.log('All shifts in localStorage:', allShifts);
    
    userShifts = allShifts[currentUser] || [];
    console.log('User shifts found:', userShifts.length, userShifts);
    
    if (userShifts.length === 0) {
        displayNoShiftsMessage('No shifts found. Click "Add shifts" to create your first shift.');
        updateTotalWage(0);
        return;
    }
    
    userShifts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    displayShifts(userShifts);
}

function displayShifts(shiftsToDisplay) {
    while (shiftsTable.rows.length > 1) {
        shiftsTable.deleteRow(1);
    }
    
    if (shiftsToDisplay.length === 0) {
        displayNoShiftsMessage('No shifts match your filter criteria');
        updateTotalWage(0);
        return;
    }
    
    let totalWage = 0;
    
    shiftsToDisplay.forEach(shift => {
        const row = shiftsTable.insertRow();
        
        const dateObj = new Date(shift.date);
        const formattedDate = dateObj.toLocaleDateString('en-GB');
        
        row.insertCell(0).textContent = formattedDate;
        row.insertCell(1).textContent = shift.startTime;
        row.insertCell(2).textContent = shift.finishTime;
        row.insertCell(3).textContent = `$${shift.hourlyWage.toFixed(2)}`;
        row.insertCell(4).textContent = shift.position;
        row.insertCell(5).textContent = shift.branch;
        row.insertCell(6).textContent = `$${shift.totalWage.toFixed(2)}`;
        
        const deleteCell = row.insertCell(7);
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.backgroundColor = '#dc3545';
        deleteBtn.style.color = 'white';
        deleteBtn.style.border = 'none';
        deleteBtn.style.padding = '5px 10px';
        deleteBtn.style.borderRadius = '4px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.onclick = () => deleteShift(shift.id);
        deleteCell.appendChild(deleteBtn);
        
        const updateCell = row.insertCell(8);
        const updateBtn = document.createElement('button');
        updateBtn.textContent = 'Update';
        updateBtn.style.backgroundColor = '#28a745';
        updateBtn.style.color = 'white';
        updateBtn.style.border = 'none';
        updateBtn.style.padding = '5px 10px';
        updateBtn.style.borderRadius = '4px';
        updateBtn.style.cursor = 'pointer';
        updateBtn.onclick = () => updateShift(shift.id);
        updateCell.appendChild(updateBtn);
        
        totalWage += shift.totalWage;
    });
    
    updateTotalWage(totalWage);
}

function displayNoShiftsMessage(message) {
    const row = shiftsTable.insertRow();
    const cell = row.insertCell(0);
    cell.colSpan = 9;
    cell.style.textAlign = 'center';
    cell.style.padding = '20px';
    cell.style.fontStyle = 'italic';
    cell.textContent = message;
}

function updateTotalWage(total) {
    totalWageDisplay.textContent = `Total Wage For Displayed Shifts: $${total.toFixed(2)}`;
}

function deleteShift(shiftId) {
    const shift = userShifts.find(s => s.id === shiftId);
    if (!shift) return;
    
    const dateObj = new Date(shift.date);
    const formattedDate = dateObj.toLocaleDateString('en-GB');
    
    const confirmMessage = `Are you sure you want to delete this shift?\n\n` +
                          `Date: ${formattedDate}\n` +
                          `Time: ${shift.startTime} - ${shift.finishTime}\n` +
                          `Position: ${shift.position}\n` +
                          `Branch: ${shift.branch}\n` +
                          `Wage: $${shift.totalWage.toFixed(2)}`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    const allShifts = JSON.parse(localStorage.getItem('shifts')) || {};
    
    allShifts[currentUser] = allShifts[currentUser].filter(shift => shift.id !== shiftId);
    
    localStorage.setItem('shifts', JSON.stringify(allShifts));
    
    loadShifts();
    
    alert('Shift deleted successfully');
}

function updateShift(shiftId) {
    localStorage.setItem('shiftToUpdate', shiftId);
    
    const shift = userShifts.find(s => s.id === shiftId);
    // if (shift) {
    //     console.log('Shift to update:', shift);
    // } else {
    //     console.log('Shift not found with ID:', shiftId);
    // }
    
    window.location.href = 'update-shift.html';
}

function setupFilters() {
    const filterButton = filterForm.querySelector('button');
    
    if (filterButton) {
        filterButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Filter button clicked');
            applyFilters();
        });
    }
    
    filterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Filter form submitted');
        applyFilters();
        return false;
    });
}

function applyFilters() {
    const selectedBranch = branchSelect.value;
    const positionFilter = positionInput.value.trim().toLowerCase();
    
    console.log('Applying filters:', { branch: selectedBranch, position: positionFilter });
    
    let filteredShifts = [...userShifts];
    
    if (selectedBranch && selectedBranch !== '') {
        filteredShifts = filteredShifts.filter(shift => shift.branch === selectedBranch);
        console.log('After branch filter:', filteredShifts.length, 'shifts');
    }
    
    if (positionFilter && positionFilter !== '') {
        filteredShifts = filteredShifts.filter(shift => 
            shift.position.toLowerCase().includes(positionFilter)
        );
        console.log('After position filter:', filteredShifts.length, 'shifts');
    }
    
    if (!selectedBranch && !positionFilter) {
        filteredShifts = [...userShifts];
        console.log('No filters applied, showing all shifts');
    }
    
    displayShifts(filteredShifts);
}

initializePage();