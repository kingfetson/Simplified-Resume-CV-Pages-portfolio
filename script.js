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

// ==================== INDEXEDDB SETUP ====================
const DB_NAME = 'PortfolioDB';
const DB_VERSION = 1;
let db;

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      // Create object stores for resume and cv
      if (!database.objectStoreNames.contains('resume')) {
        database.createObjectStore('resume', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('cv')) {
        database.createObjectStore('cv', { keyPath: 'id' });
      }
    };
  });
}

function saveFileToDB(type, file, fileData) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([type], 'readwrite');
    const store = transaction.objectStore(type);
    
    const record = {
      id: 1, // Single record
      file: file,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toLocaleString()
    };
    
    const request = store.put(record);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function getFileFromDB(type) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([type], 'readonly');
    const store = transaction.objectStore(type);
    const request = store.get(1);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deleteFileFromDB(type) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([type], 'readwrite');
    const store = transaction.objectStore(type);
    const request = store.delete(1);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ==================== FILE UPLOAD ====================
document.getElementById('resumeFileInput').addEventListener('change', function(e) {
  handleFileUpload(e, 'resume');
});

document.getElementById('cvFileInput').addEventListener('change', function(e) {
  handleFileUpload(e, 'cv');
});

async function handleFileUpload(event, type) {
  const file = event.target.files[0];
  const statusEl = document.getElementById(`${type}UploadStatus`);
  
  if (!file) return;
  
  // Check file size (max 50MB for IndexedDB)
  if (file.size > 50 * 1024 * 1024) {
    showStatus(statusEl, 'File too large. Max size is 50MB.', 'error');
    return;
  }
  
  // Check file type
  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  
  if (!validTypes.includes(file.type)) {
    showStatus(statusEl, 'Please upload a PDF or DOCX file.', 'error');
    return;
  }
  
  try {
    showStatus(statusEl, 'Uploading...', 'success');
    
    // Save to IndexedDB
    await saveFileToDB(type, file, {
      name: file.name,
      type: file.type,
      size: file.size
    });
    
    showStatus(statusEl, `✓ ${type === 'resume' ? 'Resume' : 'CV'} uploaded successfully!`, 'success');
    
    setTimeout(() => {
      loadFileDisplay(type);
    }, 1000);
    
  } catch (error) {
    console.error('Upload error:', error);
    showStatus(statusEl, 'Error uploading file. Please try again.', 'error');
  }
}

function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `upload-status ${type}`;
}

// ==================== DISPLAY & DOWNLOAD ====================
async function loadFileDisplay(type) {
  const uploadSection = document.getElementById(`${type}UploadSection`);
  const downloadSection = document.getElementById(`${type}DownloadSection`);
  const adminControls = document.getElementById(`${type}AdminControls`);
  
  try {
    const record = await getFileFromDB(type);
    
    if (record && record.file) {
      // Hide upload, show download
      uploadSection.style.display = 'none';
      downloadSection.style.display = 'flex';
      adminControls.style.display = 'block';
      
      // Create download link with proper blob URL
      const blob = new Blob([record.file], { type: record.type });
      const url = URL.createObjectURL(blob);
      
      const downloadLink = document.getElementById(`${type}DownloadLink`);
      downloadLink.href = url;
      downloadLink.download = record.name;
      
      // Show file info
      const fileInfo = document.getElementById(`${type}FileInfo`);
      const fileSize = (record.size / 1024 / 1024).toFixed(2);
      fileInfo.innerHTML = `
        <i class="fas fa-file"></i> ${record.name}<br>
        <i class="fas fa-database"></i> ${fileSize} MB | 
        <i class="fas fa-calendar"></i> ${record.uploadedAt}
      `;
    } else {
      // Show upload section
      uploadSection.style.display = 'block';
      downloadSection.style.display = 'none';
      adminControls.style.display = 'none';
    }
  } catch (error) {
    console.error('Load error:', error);
    // Show upload section on error
    uploadSection.style.display = 'block';
    downloadSection.style.display = 'none';
    adminControls.style.display = 'none';
  }
}

async function removeResume() {
  if (confirm('Remove your resume? Recruiters won\'t be able to download it.')) {
    try {
      await deleteFileFromDB('resume');
      loadFileDisplay('resume');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error removing resume');
    }
  }
}

async function removeCV() {
  if (confirm('Remove your CV? Recruiters won\'t be able to download it.')) {
    try {
      await deleteFileFromDB('cv');
      loadFileDisplay('cv');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error removing CV');
    }
  }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDB();
    loadFileDisplay('resume');
    loadFileDisplay('cv');
  } catch (error) {
    console.error('Database initialization error:', error);
    alert('Error initializing database. Please refresh the page.');
  }
});
