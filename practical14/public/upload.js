// public/upload.js
(function () {
  const form = document.getElementById('uploadForm');
  const fileInput = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const messageBox = document.getElementById('message');

  const MAX_BYTES = 2 * 1024 * 1024; // 2MB

  function showMessage(text, kind = '') {
    messageBox.textContent = text;
    messageBox.className = 'message' + (kind ? ' ' + kind : '');
  }

  fileInput.addEventListener('change', () => {
    const f = fileInput.files[0];
    if (!f) {
      showMessage('', '');
      return;
    }
    // Basic client-side checks
    if (!f.name.toLowerCase().endsWith('.pdf') || f.type !== 'application/pdf') {
      showMessage('Selected file is not a PDF.', 'error');
      return;
    }
    if (f.size > MAX_BYTES) {
      showMessage('File is too large (max 2MB).', 'error');
      return;
    }
    showMessage(`Ready to upload: ${f.name} (${Math.round(f.size/1024)} KB)`, '');
  });

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const file = fileInput.files[0];
    if (!file) return showMessage('Please select a file first.', 'error');

    // Re-validate
    if (!file.name.toLowerCase().endsWith('.pdf') || file.type !== 'application/pdf') {
      return showMessage('Only PDF files allowed.', 'error');
    }
    if (file.size > MAX_BYTES) {
      return showMessage('File too large (max 2MB).', 'error');
    }

    uploadBtn.disabled = true;
    showMessage('Uploading...', '');
    progressBar.style.width = '0%';
    progressText.textContent = '0%';

    const formData = new FormData();
    formData.append('resume', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        progressBar.style.width = pct + '%';
        progressText.textContent = pct + '%';
      }
    };

    xhr.onload = () => {
      uploadBtn.disabled = false;
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && res.success) {
          showMessage(res.message || 'Upload successful!', 'success');
          progressBar.style.width = '100%';
          progressText.textContent = '100%';
        } else {
          showMessage(res.message || 'Upload failed.', 'error');
        }
      } catch (err) {
        showMessage('Unexpected server response.', 'error');
      }
    };

    xhr.onerror = () => {
      uploadBtn.disabled = false;
      showMessage('Network or server error during upload.', 'error');
    };

    xhr.send(formData);
  });
})();
