if (!currentUser) {
    alert('Please login to manage your resume');
    window.location.href = 'login.html';
}

const educationForm = document.getElementById('education-form');
const occupationForm = document.getElementById('occupation-form');

const eduStartYear = document.getElementById('start_year');
const eduEndYear = document.getElementById('end_year');
const institutionName = document.getElementById('institution_name');
const studyType = document.getElementById('study_type');
const eduDescription = document.getElementById('edu_description');

const workStartYear = document.getElementById('work_start_year');
const workEndYear = document.getElementById('work_end_year');
const workplaceName = document.getElementById('workplace_name');
const roleName = document.getElementById('role_name');
const workDescription = document.getElementById('work_description');

const eduErrorMessage = document.getElementById('edu-error-message');
const eduSuccessMessage = document.getElementById('edu-success-message');
const workErrorMessage = document.getElementById('work-error-message');
const workSuccessMessage = document.getElementById('work-success-message');

let editingEducationId = null;
let editingOccupationId = null;


function initializePage() {
    console.log('Initializing resume page for user:', currentUser);
    
    loadEducationRecords();
    loadOccupationRecords();
    
    setupEducationForm();
    setupOccupationForm();
    
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear + 5;
    
    [eduStartYear, eduEndYear, workStartYear, workEndYear].forEach(input => {
        if (input) {
            input.max = maxYear;
        }
    });
}

function showEduError(message) {
    if (eduErrorMessage) {
        eduErrorMessage.textContent = message;
        eduErrorMessage.style.display = 'block';
    }
    if (eduSuccessMessage) {
        eduSuccessMessage.style.display = 'none';
    }
}

function showEduSuccess(message) {
    if (eduSuccessMessage) {
        eduSuccessMessage.textContent = message;
        eduSuccessMessage.style.display = 'block';
    }
    if (eduErrorMessage) {
        eduErrorMessage.style.display = 'none';
    }
}

function hideEduMessages() {
    if (eduErrorMessage) {
        eduErrorMessage.style.display = 'none';
        eduErrorMessage.textContent = '';
    }
    if (eduSuccessMessage) {
        eduSuccessMessage.style.display = 'none';
        eduSuccessMessage.textContent = '';
    }
}

function showWorkError(message) {
    if (workErrorMessage) {
        workErrorMessage.textContent = message;
        workErrorMessage.style.display = 'block';
    }
    if (workSuccessMessage) {
        workSuccessMessage.style.display = 'none';
    }
}

function showWorkSuccess(message) {
    if (workSuccessMessage) {
        workSuccessMessage.textContent = message;
        workSuccessMessage.style.display = 'block';
    }
    if (workErrorMessage) {
        workErrorMessage.style.display = 'none';
    }
}

function hideWorkMessages() {
    if (workErrorMessage) {
        workErrorMessage.style.display = 'none';
        workErrorMessage.textContent = '';
    }
    if (workSuccessMessage) {
        workSuccessMessage.style.display = 'none';
        workSuccessMessage.textContent = '';
    }
}

function loadEducationRecords() {
    console.log('Loading education records');
    
    const container = document.getElementById('education-records');
    if (!container) return;
    
    container.innerHTML = '';
    
    const resumes = JSON.parse(localStorage.getItem('resumes')) || {};
    const userResume = resumes[currentUser] || { education: [], occupation: [] };
    const educationList = userResume.education || [];
    
    if (educationList.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No education records found. Add your first education record above.</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '20px';
    
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th style="padding: 10px; background-color: #007bff; color: white; text-align: left;">Institution</th>
        <th style="padding: 10px; background-color: #007bff; color: white; text-align: left;">Degree/Certificate</th>
        <th style="padding: 10px; background-color: #007bff; color: white; text-align: center;">Years</th>
        <th style="padding: 10px; background-color: #007bff; color: white; text-align: left;">Additional Info</th>
        <th style="padding: 10px; background-color: #007bff; color: white; text-align: center;">Actions</th>
    `;
    table.appendChild(headerRow);
    
    educationList.forEach(edu => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #ddd';

        const description = edu.description ? 
            (edu.description.length > 100 ? edu.description.substring(0, 100) + '...' : edu.description) : 
            '<em style="color: #999;">No additional info</em>';
        
        row.innerHTML = `
            <td style="padding: 10px;">${edu.institutionName}</td>
            <td style="padding: 10px;">${edu.studyType}</td>
            <td style="padding: 10px; text-align: center;">${edu.startYear} - ${edu.endYear || 'Present'}</td>
            <td style="padding: 10px; color: #666; font-size: 14px;">${description}</td>
            <td style="padding: 10px; text-align: center; white-space: nowrap;">
                <button onclick="editEducation('${edu.id}')" style="background-color: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Edit</button>
                <button onclick="deleteEducation('${edu.id}')" style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Delete</button>
            </td>
        `;
        
        table.appendChild(row);
        
        if (edu.description && edu.description.length > 100) {
            const fullDescRow = document.createElement('tr');
            fullDescRow.id = `edu-desc-${edu.id}`;
            fullDescRow.style.display = 'none';
            fullDescRow.style.backgroundColor = '#f9f9f9';
            fullDescRow.innerHTML = `
                <td colspan="5" style="padding: 15px; color: #555;">
                    <strong>Full Description:</strong><br>
                    <div style="margin-top: 10px; line-height: 1.6;">${edu.description}</div>
                </td>
            `;
            table.appendChild(fullDescRow);

            row.style.cursor = 'pointer';
            row.title = 'Click to show/hide full description';
            row.addEventListener('click', function(e) {
                if (e.target.tagName !== 'BUTTON') {
                    const descRow = document.getElementById(`edu-desc-${edu.id}`);
                    descRow.style.display = descRow.style.display === 'none' ? 'table-row' : 'none';
                }
            });
        }
    });
    
    container.appendChild(table);
}

function loadOccupationRecords() {
    console.log('Loading occupation records');
    
    const container = document.getElementById('occupation-records');
    if (!container) return;

    container.innerHTML = '';
    
    const resumes = JSON.parse(localStorage.getItem('resumes')) || {};
    const userResume = resumes[currentUser] || { education: [], occupation: [] };
    const occupationList = userResume.occupation || [];
    
    if (occupationList.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No work experience found. Add your first work experience above.</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '20px';

    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th style="padding: 10px; background-color: #007bff; color: white; text-align: left;">Workplace</th>
        <th style="padding: 10px; background-color: #007bff; color: white; text-align: left;">Role</th>
        <th style="padding: 10px; background-color: #007bff; color: white; text-align: center;">Years</th>
        <th style="padding: 10px; background-color: #007bff; color: white; text-align: left;">Description</th>
        <th style="padding: 10px; background-color: #007bff; color: white; text-align: center;">Actions</th>
    `;
    table.appendChild(headerRow);
    
    occupationList.forEach(work => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #ddd';
        
        const description = work.description ? 
            (work.description.length > 100 ? work.description.substring(0, 100) + '...' : work.description) : 
            '<em style="color: #999;">No description</em>';
        
        row.innerHTML = `
            <td style="padding: 10px;">${work.workplaceName}</td>
            <td style="padding: 10px;">${work.roleName}</td>
            <td style="padding: 10px; text-align: center;">${work.startYear} - ${work.endYear || 'Present'}</td>
            <td style="padding: 10px; color: #666; font-size: 14px;">${description}</td>
            <td style="padding: 10px; text-align: center; white-space: nowrap;">
                <button onclick="editOccupation('${work.id}')" style="background-color: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Edit</button>
                <button onclick="deleteOccupation('${work.id}')" style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Delete</button>
            </td>
        `;
        
        table.appendChild(row);
        
        if (work.description && work.description.length > 100) {
            const fullDescRow = document.createElement('tr');
            fullDescRow.id = `work-desc-${work.id}`;
            fullDescRow.style.display = 'none';
            fullDescRow.style.backgroundColor = '#f9f9f9';
            fullDescRow.innerHTML = `
                <td colspan="5" style="padding: 15px; color: #555;">
                    <strong>Full Job Description:</strong><br>
                    <div style="margin-top: 10px; line-height: 1.6;">${work.description}</div>
                </td>
            `;
            table.appendChild(fullDescRow);
            
            row.style.cursor = 'pointer';
            row.title = 'Click to show/hide full description';
            row.addEventListener('click', function(e) {
                if (e.target.tagName !== 'BUTTON') {
                    const descRow = document.getElementById(`work-desc-${work.id}`);
                    descRow.style.display = descRow.style.display === 'none' ? 'table-row' : 'none';
                }
            });
        }
    });
    
    container.appendChild(table);
}

function setupEducationForm() {
    if (!educationForm) return;
    
    educationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        hideEduMessages();
        
        if (!eduStartYear.value) {
            showEduError('Start Year is required');
            return;
        }
        
        if (!institutionName.value.trim()) {
            showEduError('Institution Name is required');
            return;
        }
        
        if (!studyType.value) {
            showEduError('Please select a Certificate/Degree');
            return;
        }
        
        if (eduEndYear.value) {
            const startYear = parseInt(eduStartYear.value);
            const endYear = parseInt(eduEndYear.value);
            
            if (endYear < startYear) {
                showEduError('End Year cannot be before Start Year');
                return;
            }
        }
        
        const resumes = JSON.parse(localStorage.getItem('resumes')) || {};
        const userResume = resumes[currentUser] || { education: [], occupation: [] };
        
        const educationRecord = {
            id: editingEducationId || Date.now().toString(),
            startYear: eduStartYear.value,
            endYear: eduEndYear.value,
            institutionName: institutionName.value.trim(),
            studyType: studyType.value,
            description: eduDescription.value.trim(),
            createdAt: editingEducationId ? 
                userResume.education.find(e => e.id === editingEducationId)?.createdAt : 
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (editingEducationId) {
            const index = userResume.education.findIndex(edu => edu.id === editingEducationId);
            if (index !== -1) {
                userResume.education[index] = educationRecord;
            }
            editingEducationId = null;
            
            const submitBtn = educationForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Add';
            
            showEduSuccess('Education record updated successfully!');
        } else {
            userResume.education.push(educationRecord);
            showEduSuccess('Education record added successfully!');
        }
        
        resumes[currentUser] = userResume;
        localStorage.setItem('resumes', JSON.stringify(resumes));
        
        educationForm.reset();
        
        loadEducationRecords();
    });

    const eduInputs = [eduStartYear, eduEndYear, institutionName, studyType, eduDescription];
    eduInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', hideEduMessages);
            input.addEventListener('change', hideEduMessages);
        }
    });
}

function setupOccupationForm() {
    if (!occupationForm) return;
    
    occupationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        hideWorkMessages();
        
        if (!workStartYear.value) {
            showWorkError('Start Year is required');
            return;
        }
        
        if (!workplaceName.value.trim()) {
            showWorkError('Workplace Name is required');
            return;
        }
        
        if (!roleName.value.trim()) {
            showWorkError('Role Name is required');
            return;
        }
        
        if (workEndYear.value) {
            const startYear = parseInt(workStartYear.value);
            const endYear = parseInt(workEndYear.value);
            
            if (endYear < startYear) {
                showWorkError('End Year cannot be before Start Year');
                return;
            }
        }
        
        const resumes = JSON.parse(localStorage.getItem('resumes')) || {};
        const userResume = resumes[currentUser] || { education: [], occupation: [] };
        
        const occupationRecord = {
            id: editingOccupationId || Date.now().toString(),
            startYear: workStartYear.value,
            endYear: workEndYear.value,
            workplaceName: workplaceName.value.trim(),
            roleName: roleName.value.trim(),
            description: workDescription.value.trim(),
            createdAt: editingOccupationId ? 
                userResume.occupation.find(o => o.id === editingOccupationId)?.createdAt : 
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (editingOccupationId) {
            const index = userResume.occupation.findIndex(work => work.id === editingOccupationId);
            if (index !== -1) {
                userResume.occupation[index] = occupationRecord;
            }
            editingOccupationId = null;

            const submitBtn = occupationForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Add';
            
            showWorkSuccess('Work experience updated successfully!');
        } else {
            userResume.occupation.push(occupationRecord);
            showWorkSuccess('Work experience added successfully!');
        }
        
        resumes[currentUser] = userResume;
        localStorage.setItem('resumes', JSON.stringify(resumes));
        
        occupationForm.reset();
        
        loadOccupationRecords();
    });
    
    const workInputs = [workStartYear, workEndYear, workplaceName, roleName, workDescription];
    workInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', hideWorkMessages);
            input.addEventListener('change', hideWorkMessages);
        }
    });
}

function editEducation(id) {
    const resumes = JSON.parse(localStorage.getItem('resumes')) || {};
    const userResume = resumes[currentUser] || { education: [], occupation: [] };
    const education = userResume.education.find(edu => edu.id === id);
    
    if (education) {
        eduStartYear.value = education.startYear;
        eduEndYear.value = education.endYear || '';
        institutionName.value = education.institutionName;
        studyType.value = education.studyType;
        eduDescription.value = education.description || '';
        
        editingEducationId = id;
        
        const submitBtn = educationForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Update';
        
        educationForm.scrollIntoView({ behavior: 'smooth' });
        
        hideEduMessages();
    }
}

function deleteEducation(id) {
    const resumes = JSON.parse(localStorage.getItem('resumes')) || {};
    const userResume = resumes[currentUser] || { education: [], occupation: [] };
    const education = userResume.education.find(edu => edu.id === id);
    
    if (!education) return;
    
    const confirmMessage = `Are you sure you want to delete this education record?\n\n` +
                          `Institution: ${education.institutionName}\n` +
                          `Degree/Certificate: ${education.studyType}\n` +
                          `Years: ${education.startYear} - ${education.endYear || 'Present'}`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    userResume.education = userResume.education.filter(edu => edu.id !== id);
    
    resumes[currentUser] = userResume;
    localStorage.setItem('resumes', JSON.stringify(resumes));
    
    loadEducationRecords();
    
    showEduSuccess('Education record deleted successfully!');
}

function editOccupation(id) {
    const resumes = JSON.parse(localStorage.getItem('resumes')) || {};
    const userResume = resumes[currentUser] || { education: [], occupation: [] };
    const occupation = userResume.occupation.find(work => work.id === id);
    
    if (occupation) {
        workStartYear.value = occupation.startYear;
        workEndYear.value = occupation.endYear || '';
        workplaceName.value = occupation.workplaceName;
        roleName.value = occupation.roleName;
        workDescription.value = occupation.description || '';

        editingOccupationId = id;

        const submitBtn = occupationForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Update';

        occupationForm.scrollIntoView({ behavior: 'smooth' });
        
        hideWorkMessages();
    }
}

function deleteOccupation(id) {
    const resumes = JSON.parse(localStorage.getItem('resumes')) || {};
    const userResume = resumes[currentUser] || { education: [], occupation: [] };
    const occupation = userResume.occupation.find(work => work.id === id);
    
    if (!occupation) return;
    
    const confirmMessage = `Are you sure you want to delete this work experience?\n\n` +
                          `Workplace: ${occupation.workplaceName}\n` +
                          `Role: ${occupation.roleName}\n` +
                          `Years: ${occupation.startYear} - ${occupation.endYear || 'Present'}`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    userResume.occupation = userResume.occupation.filter(work => work.id !== id);
    
    resumes[currentUser] = userResume;
    localStorage.setItem('resumes', JSON.stringify(resumes));
    
    loadOccupationRecords();
    
    showWorkSuccess('Work experience deleted successfully!');
}

window.editEducation = editEducation;
window.deleteEducation = deleteEducation;
window.editOccupation = editOccupation;
window.deleteOccupation = deleteOccupation;

initializePage();