// Homepage functionality - Display and manage user shifts
// currentUser is already declared in menu.js which loads first
const shiftsTable = document.querySelector('.shifts-table');
const filterForm = document.querySelector('.filter-form');
const branchSelect = document.getElementById('branch-filter');
const positionInput = document.getElementById('job_position');
const totalWageDisplay = document.querySelector('p');

// Store all user shifts for filtering
let userShifts = [];

// Initialize the page
function initializePage() {
    console.log('Initializing homepage...');
    
    // Check if elements exist
    console.log('Elements check:', {
        shiftsTable: !!shiftsTable,
        filterForm: !!filterForm,
        branchSelect: !!branchSelect,
        positionInput: !!positionInput
    });
    
    // Load and display shifts
    loadShifts();
    
    // Set up filter functionality
    setupFilters();
}

// Load shifts from localStorage
function loadShifts() {
    console.log('Loading shifts for user:', currentUser);
    
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
    console.log('All shifts in localStorage:', allShifts);
    
    userShifts = allShifts[currentUser] || [];
    console.log('User shifts found:', userShifts.length, userShifts);
    
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
                          `Wage: $${shift.totalWage.toFixed(2)}`;
    
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
    // Get the filter button
    const filterButton = filterForm.querySelector('button');
    
    if (filterButton) {
        // Add click event to filter button
        filterButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Filter button clicked');
            applyFilters();
        });
    }
    
    // Also handle form submission (in case Enter is pressed)
    filterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Filter form submitted');
        applyFilters();
        return false;
    });
}

// Apply filters to shifts
function applyFilters() {
    const selectedBranch = branchSelect.value;
    const positionFilter = positionInput.value.trim().toLowerCase();
    
    console.log('Applying filters:', { branch: selectedBranch, position: positionFilter });
    
    // Start with all user shifts
    let filteredShifts = [...userShifts];
    
    // Filter by branch if one is selected (not "All Branches")
    if (selectedBranch && selectedBranch !== '') {
        filteredShifts = filteredShifts.filter(shift => shift.branch === selectedBranch);
        console.log('After branch filter:', filteredShifts.length, 'shifts');
    }
    
    // Filter by position if text is entered
    if (positionFilter && positionFilter !== '') {
        filteredShifts = filteredShifts.filter(shift => 
            shift.position.toLowerCase().includes(positionFilter)
        );
        console.log('After position filter:', filteredShifts.length, 'shifts');
    }
    
    // If no filters are applied, show all shifts
    if (!selectedBranch && !positionFilter) {
        filteredShifts = [...userShifts];
        console.log('No filters applied, showing all shifts');
    }
    
    // Display filtered shifts
    displayShifts(filteredShifts);
}

// Initialize page when DOM is loaded
initializePage();