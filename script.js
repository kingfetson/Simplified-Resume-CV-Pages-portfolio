// Navigation
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const mobileToggle = document.querySelector('.mobile-toggle');
const navMenu = document.querySelector('.nav-menu');

function navigateTo(pageId) {
  navLinks.forEach(l => l.classList.remove('active'));
  document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
  pages.forEach(p => p.classList.remove('active-page'));
  document.getElementById(pageId).classList.add('active-page');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(link.dataset.page);
    if (window.innerWidth <= 600) navMenu.classList.remove('active');
  });
});

mobileToggle.addEventListener('click', () => navMenu.classList.toggle('active'));

// Storage Keys
const RESUME_KEY = 'portfolio_resume';
const CV_KEY = 'portfolio_cv';

// Upload Handlers
document.getElementById('resumeFileInput').addEventListener('change', function(e) {
  handleFileUpload(e, 'resume');
});

document.getElementById('cvFileInput').addEventListener('change', function(e) {
  handleFileUpload(e, 'cv');
});

function handleFileUpload(event, type) {
  const file = event.target.files[0];
  const statusEl = document.getElementById(`${type}UploadStatus`);
  
  if (!file) return;
  
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    showStatus(statusEl, 'File too large. Max size is 10MB.', 'error');
    return;
  }
  
  // Check file type
  const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
  if (!validTypes.includes(file.type)) {
    showStatus(statusEl, 'Please upload a PDF or DOCX file.', 'error');
    return;
  }
  
  // Read file as Data URL
  const reader = new FileReader();
  reader.onload = function(e) {
    const fileData = {
      name: file.name,
      type: file.type,
      size: file.size,
      data: e.target.result,
      uploadedAt: new Date().toLocaleString()
    };
    
    // Save to localStorage
    const storageKey = type === 'resume' ? RESUME_KEY : CV_KEY;
    localStorage.setItem(storageKey, JSON.stringify(fileData));
    
    // Show success
    showStatus(statusEl, `✓ ${type === 'resume' ? 'Resume' : 'CV'} uploaded successfully!`, 'success');
    
    // Update display
    setTimeout(() => {
      loadFileDisplay(type);
    }, 1000);
  };
  
  reader.onerror = function() {
    showStatus(statusEl, 'Error reading file. Please try again.', 'error');
  };
  
  reader.readAsDataURL(file);
}

function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `upload-status ${type}`;
}

function loadFileDisplay(type) {
  const storageKey = type === 'resume' ? RESUME_KEY : CV_KEY;
  const storedData = localStorage.getItem(storageKey);
  
  const uploadSection = document.getElementById(`${type}UploadSection`);
  const downloadSection = document.getElementById(`${type}DownloadSection`);
  const adminControls = document.getElementById(`${type}AdminControls`);
  
  if (storedData) {
    const fileData = JSON.parse(storedData);
    
    // Hide upload, show download
    uploadSection.style.display = 'none';
    downloadSection.style.display = 'flex';
    adminControls.style.display = 'block';
    
    // Set download link
    const downloadLink = document.getElementById(`${type}DownloadLink`);
    downloadLink.href = fileData.data;
    downloadLink.download = fileData.name;
    
    // Show file info
    const fileInfo = document.getElementById(`${type}FileInfo`);
    const fileSize = (fileData.size / 1024 / 1024).toFixed(2);
    fileInfo.innerHTML = `
      <i class="fas fa-file"></i> ${fileData.name}<br>
      <i class="fas fa-database"></i> ${fileSize} MB | 
      <i class="fas fa-calendar"></i> ${fileData.uploadedAt}
    `;
  } else {
    // Show upload section
    uploadSection.style.display = 'block';
    downloadSection.style.display = 'none';
    adminControls.style.display = 'none';
  }
}

function removeResume() {
  if (confirm('Remove your resume? Recruiters won\'t be able to download it.')) {
    localStorage.removeItem(RESUME_KEY);
    loadFileDisplay('resume');
  }
}

function removeCV() {
  if (confirm('Remove your CV? Recruiters won\'t be able to download it.')) {
    localStorage.removeItem(CV_KEY);
    loadFileDisplay('cv');
  }
}

// Load on page load
document.addEventListener('DOMContentLoaded', () => {
  loadFileDisplay('resume');
  loadFileDisplay('cv');
});
