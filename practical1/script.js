const votes = {
  JavaScript: 0,
  Python: 0,
  Java: 0
};

function vote(language) {
  votes[language]++;
  updateVotes();
}

function updateVotes() {
  document.getElementById('js-count').textContent = votes['JavaScript'];
  document.getElementById('python-count').textContent = votes['Python'];
  document.getElementById('java-count').textContent = votes['Java'];
}

// Simulate real-time voting from other users
setInterval(() => {
  const languages = ['JavaScript', 'Python', 'Java'];
  const randomLang = languages[Math.floor(Math.random() * languages.length)];
  votes[randomLang]++;
  updateVotes();
}, 2000);





