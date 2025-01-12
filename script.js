
let currentSubject = null;

// Generate a unique ID using timestamp + random number
function generateUniqueId() {
  const timestamp = Date.now().toString(36); // Convert timestamp to base-36 string
  const random = Math.random().toString(36).substring(2, 8); // Random 6-character string
  return `${timestamp}-${random}`; // Combine timestamp and random string
}

// Load videos from LocalStorage when the page loads
document.addEventListener('DOMContentLoaded', function () {
  // Initialize localStorage if empty
  if (!localStorage.getItem('videos')) {
    localStorage.setItem('videos', JSON.stringify([]));
  }

  const subjectSelect = document.getElementById('subjectSelect');
  subjectSelect.addEventListener('change', function () {
    currentSubject = this.value;
    if (currentSubject) {
      document.getElementById('videoFormContainer').style.display = 'block';
      document.getElementById('subjectProgressContainer').style.display = 'block';
      showVideos(currentSubject);
    } else {
      document.getElementById('videoFormContainer').style.display = 'none';
      document.getElementById('subjectProgressContainer').style.display = 'none';
      document.getElementById('videoList').innerHTML = '';
    }
  });

  // Dark Mode Toggle
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
  });

  // Clear All Button
  const clearAllButton = document.getElementById('clearAllButton');
  clearAllButton.addEventListener('click', function () {
    if (!currentSubject) {
      alert("Please select a subject first.");
      return;
    }

    const confirmation = confirm(`Are you sure you want to clear all videos for ${currentSubject}?`);
    if (!confirmation) return;

    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    const updatedVideos = videos.filter(video => video.subject !== currentSubject);
    localStorage.setItem('videos', JSON.stringify(updatedVideos));

    showVideos(currentSubject);
  });
});

// Add video to the list and LocalStorage
document.getElementById('videoForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const title = document.getElementById('videoTitle').value;
  const duration = parseInt(document.getElementById('videoDuration').value);

  if (title && duration && currentSubject) {
    const id = generateUniqueId(); // Generate unique ID
    addVideoToList(title, duration, false, currentSubject, id);
    saveVideoToLocalStorage(title, duration, false, currentSubject, id);
    document.getElementById('videoForm').reset();
    showVideos(currentSubject);
  }
});

// Process bulk input
function processBulkInput() {
  const bulkInput = document.getElementById('bulkInput').value;
  if (!bulkInput || !currentSubject) return;

  const lines = bulkInput.split('\n');
  lines.forEach(line => {
    const [title, duration] = line.split(',').map(item => item.trim());
    if (title && duration && !isNaN(duration)) {
      const id = generateUniqueId(); // Generate unique ID
      addVideoToList(title, parseInt(duration), false, currentSubject, id);
      saveVideoToLocalStorage(title, parseInt(duration), false, currentSubject, id);
    } else {
      alert(`Invalid format in line: ${line}. Please use the format: Video title, duration`);
    }
  });

  document.getElementById('bulkInput').value = '';
  showVideos(currentSubject);
}

// Add video to the UI
function addVideoToList(title, duration, completed, subject, id) {
  const videoList = document.getElementById('videoList');
  const videoItem = document.createElement('div');
  videoItem.className = 'video-item';
  videoItem.dataset.id = id;
  videoItem.dataset.status = completed ? 'completed' : 'pending';

  videoItem.innerHTML = `
    <div class="content">
      <div class="title">${title}</div>
      <div class="duration">${duration} mins</div>
      <div class="status">
        <input type="checkbox" class="video-checkbox" data-id="${id}" data-duration="${duration}" ${completed ? 'checked' : ''}>
        <span>${completed ? 'Completed' : 'Not Completed'}</span>
      </div>
      <div class="actions">
        <i class="fas fa-edit" onclick="editVideo(this)"></i>
        <i class="fas fa-trash" onclick="deleteVideo(this)"></i>
      </div>
    </div>
  `;

  videoList.appendChild(videoItem);

  const checkbox = videoItem.querySelector('.video-checkbox');
  checkbox.addEventListener('change', function () {
    updateVideoInLocalStorage(this.dataset.id, this.checked);
    showVideos(currentSubject);
    updateProgress();
  });
}

// Save video to LocalStorage
function saveVideoToLocalStorage(title, duration, completed, subject, id) {
  const videos = JSON.parse(localStorage.getItem('videos')) || [];
  videos.push({ id, title, duration, completed, subject });
  localStorage.setItem('videos', JSON.stringify(videos));
}

// Update video completion status in LocalStorage
function updateVideoInLocalStorage(id, completed) {
  const videos = JSON.parse(localStorage.getItem('videos')) || [];
  const videoIndex = videos.findIndex(video => video.id === id);
  if (videoIndex !== -1) {
    videos[videoIndex].completed = completed;
    localStorage.setItem('videos', JSON.stringify(videos));
  }
}

// Show videos for the selected subject
function showVideos(subject) {
  const videos = JSON.parse(localStorage.getItem('videos')) || [];
  const videoList = document.getElementById('videoList');
  videoList.innerHTML = '';

  const subjectVideos = videos.filter(video => video.subject === subject);

  const subjectProgressContainer = document.getElementById('subjectProgressContainer');
  const selectedSubject = document.getElementById('selectedSubject');
  const subjectProgress = document.getElementById('subjectProgress');
  const subjectProgressText = document.getElementById('subjectProgressText');

  subjectProgressContainer.style.display = 'block';
  selectedSubject.textContent = subject;

  let totalDuration = 0;
  let completedDuration = 0;

  subjectVideos.forEach(video => {
    totalDuration += video.duration;
    if (video.completed) {
      completedDuration += video.duration;
    }
  });

  const progressPercentage = (completedDuration / totalDuration) * 100 || 0;
  subjectProgress.style.width = `${progressPercentage}%`;
  subjectProgressText.innerText = `${Math.round(progressPercentage)}% completed`;

  subjectVideos.forEach(video => {
    addVideoToList(video.title, video.duration, video.completed, video.subject, video.id);
  });

  updateProgress();
}

// Update overall progress bar
function updateProgress() {
  const videos = JSON.parse(localStorage.getItem('videos')) || [];
  let totalDuration = 0;
  let completedDuration = 0;

  videos.forEach(video => {
    totalDuration += video.duration;
    if (video.completed) {
      completedDuration += video.duration;
    }
  });

  const progressPercentage = (completedDuration / totalDuration) * 100 || 0;
  document.getElementById('progress').style.width = `${progressPercentage}%`;
  document.getElementById('progressText').innerText = `${Math.round(progressPercentage)}% completed`;
}

// Edit video title and duration
function editVideo(editIcon) {
  const videoItem = editIcon.closest('.video-item');
  const videoTitle = videoItem.querySelector('.title').textContent;
  const videoDuration = videoItem.querySelector('.duration').textContent.replace(' mins', '');

  videoItem.querySelector('.content').innerHTML = `
    <input type="text" class="edit-input" value="${videoTitle}" placeholder="Video Title">
    <input type="number" class="edit-input" value="${videoDuration}" placeholder="Duration">
    <div class="status">
      <input type="checkbox" class="video-checkbox" data-id="${videoItem.dataset.id}" data-duration="${videoDuration}" ${videoItem.querySelector('.video-checkbox').checked ? 'checked' : ''}>
      <span>${videoItem.querySelector('.video-checkbox').checked ? 'Completed' : 'Not Completed'}</span>
    </div>
    <div class="actions">
      <i class="fas fa-save" onclick="saveVideo(this)"></i>
      <i class="fas fa-trash" onclick="deleteVideo(this)"></i>
    </div>
  `;
}

// Save edited video title and duration
function saveVideo(saveIcon) {
  const videoItem = saveIcon.closest('.video-item');
  const videoTitleInput = videoItem.querySelector('input[type="text"]');
  const videoDurationInput = videoItem.querySelector('input[type="number"]');
  const videoTitle = videoTitleInput.value.trim();
  const videoDuration = parseInt(videoDurationInput.value.trim());

  if (!videoTitle || isNaN(videoDuration)) {
    alert("Please enter a valid title and duration.");
    return;
  }

  const videos = JSON.parse(localStorage.getItem('videos')) || [];
  const videoIndex = videos.findIndex(video => video.id === videoItem.dataset.id);
  if (videoIndex !== -1) {
    videos[videoIndex].title = videoTitle;
    videos[videoIndex].duration = videoDuration;
    localStorage.setItem('videos', JSON.stringify(videos));
  }

  showVideos(currentSubject);
}

// Delete a video
function deleteVideo(deleteIcon) {
  const videoItem = deleteIcon.closest('.video-item');
  const videoId = videoItem.dataset.id;

  const confirmation = confirm(`Are you sure you want to delete this video?`);
  if (!confirmation) return;

  const videos = JSON.parse(localStorage.getItem('videos')) || [];
  const updatedVideos = videos.filter(video => video.id !== videoId);
  localStorage.setItem('videos', JSON.stringify(updatedVideos));

  videoItem.remove();
  showVideos(currentSubject);
}
