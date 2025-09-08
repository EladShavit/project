// Homepage functionality - Display and manage user shifts
// currentUser is already declared in menu.js which loads first
const shiftsTable = document.querySelector('.shifts-table');
const filterForm = document.querySelector('.filter-form');
const branchSelect = filterForm.querySelector('select');
const positionInput = document.getElementById('job_position');
const totalWageDisplay = document.querySelector('p');
const addShiftsButton = document.querySelector('button:last-child');

// Store all user shifts for filtering
let userShifts = [];

// Initialize the page
function initializePage() {
    // Handle add shifts button
    addShiftsButton.addEventListener('click', function() {
        if (!currentUser) {
            alert('Please login to add shifts');
            window.location.href = 'login.html';
        } else {
            window.location.href = 'update-shift.html';
        }
    });
    
    // Load and display shifts
    loadShifts();
    
    // Set up filter functionality
    setupFilters();
}

// Load shifts from localStorage
function loadShifts() {
    // Clear existing rows (except header)
    while (shiftsTable.rows.length > 1) {
        shiftsTable.deleteRow(1);
    }
    
    // Check if user is logged in
    if (!currentUser) {
        displayNoShiftsMessage('Please login to view your shifts');
        updateTotalWage(0);
        return;
    }
    
    // Get all shifts from localStorage
    const allShifts = JSON.parse(localStorage.getItem('shifts')) || {};
    userShifts = allShifts[currentUser] || [];
    
    if (userShifts.length === 0) {
        displayNoShiftsMessage('No shifts found. Click "Add shifts" to create your first shift.');
        updateTotalWage(0);
        return;
    }
    
    // Sort shifts by date (newest first)
    userShifts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display all shifts initially
    displayShifts(userShifts);
}

// Display shifts in the table
function displayShifts(shiftsToDisplay) {
    // Clear existing rows (except header)
    while (shiftsTable.rows.length > 1) {
        shiftsTable.deleteRow(1);
    }
    
    if (shiftsToDisplay.length === 0) {
        displayNoShiftsMessage('No shifts match your filter criteria');
        updateTotalWage(0);
        return;
    }
    
    let totalWage = 0;
    
    // Add each shift as a row
    shiftsToDisplay.forEach(shift => {
        const row = shiftsTable.insertRow();
        
        // Format date for display
        const dateObj = new Date(shift.date);
        const formattedDate = dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY format
        
        // Add cells
        row.insertCell(0).textContent = formattedDate;
        row.insertCell(1).textContent = shift.startTime;
        row.insertCell(2).textContent = shift.finishTime;
        row.insertCell(3).textContent = `$${shift.hourlyWage.toFixed(2)}`;
        row.insertCell(4).textContent = shift.position;
        row.insertCell(5).textContent = shift.branch;
        row.insertCell(6).textContent = `$${shift.totalWage.toFixed(2)}`;
        
        // Add Delete button
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
        
        // Add Update button
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
        
        // Add to total wage
        totalWage += shift.totalWage;
    });
    
    updateTotalWage(totalWage);
}

// Display message when no shifts
function displayNoShiftsMessage(message) {
    const row = shiftsTable.insertRow();
    const cell = row.insertCell(0);
    cell.colSpan = 9;
    cell.style.textAlign = 'center';
    cell.style.padding = '20px';
    cell.style.fontStyle = 'italic';
    cell.textContent = message;
}

// Update total wage display
function updateTotalWage(total) {
    totalWageDisplay.textContent = `Total Wage For Displayed Shifts: $${total.toFixed(2)}`;
}

// Delete shift function
function deleteShift(shiftId) {
    // Find the shift to get its details for the confirmation message
    const shift = userShifts.find(s => s.id === shiftId);
    if (!shift) return;
    
    const dateObj = new Date(shift.date);
    const formattedDate = dateObj.toLocaleDateString('en-GB');
    
    // Show detailed confirmation prompt
    const confirmMessage = `Are you sure you want to delete this shift?\n\n` +
                          `Date: ${formattedDate}\n` +
                          `Time: ${shift.startTime} - ${shift.finishTime}\n` +
                          `Position: ${shift.position}\n` +
                          `Branch: ${shift.branch}\n` +
                          `Wage: ${shift.totalWage.toFixed(2)}`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Get all shifts
    const allShifts = JSON.parse(localStorage.getItem('shifts')) || {};
    
    // Filter out the deleted shift
    allShifts[currentUser] = allShifts[currentUser].filter(shift => shift.id !== shiftId);
    
    // Save back to localStorage
    localStorage.setItem('shifts', JSON.stringify(allShifts));
    
    // Reload shifts
    loadShifts();
    
    alert('Shift deleted successfully');
}

// Update shift function
function updateShift(shiftId) {
    // Store the shift ID to be updated
    localStorage.setItem('shiftToUpdate', shiftId);
    
    // Debug: Let's verify the shift exists
    const shift = userShifts.find(s => s.id === shiftId);
    if (shift) {
        console.log('Shift to update:', shift);
    } else {
        console.log('Shift not found with ID:', shiftId);
    }
    
    // Redirect to update page
    window.location.href = 'update-shift.html';
}

// Set up filter functionality
function setupFilters() {
    // Get unique branches from user shifts
    updateBranchOptions();
    
    // Filter form submission
    filterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        applyFilters();
    });
}

// Apply filters to shifts
function applyFilters() {
    const selectedBranch = branchSelect.value;
    const positionFilter = positionInput.value.trim().toLowerCase();
    
    let filteredShifts = [...userShifts];
    
    // Filter by branch
    if (selectedBranch) {
        filteredShifts = filteredShifts.filter(shift => shift.branch === selectedBranch);
    }
    
    // Filter by position
    if (positionFilter) {
        filteredShifts = filteredShifts.filter(shift => 
            shift.position.toLowerCase().includes(positionFilter)
        );
    }
    
    // Display filtered shifts
    displayShifts(filteredShifts);
}

// Initialize page when DOM is loaded
initializePage();