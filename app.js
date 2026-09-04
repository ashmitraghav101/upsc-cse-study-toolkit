async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json();
}

function renderSyllabus(subjects, query = "") {
  const grid = document.querySelector("#syllabusGrid");
  const q = query.toLowerCase().trim();
  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.topics.some(t => t.toLowerCase().includes(q))
  );

  grid.innerHTML = filtered.map(s => `
    <article class="subject">
      <h3>${escapeHTML(s.name)}</h3>
      <ul>${s.topics.map(t => `<li>${escapeHTML(t)}</li>`).join("")}</ul>
    </article>
  `).join("") || "<p>No matching topics found.</p>";
}

function renderQuestions(questions) {
  document.querySelector("#questionList").innerHTML = questions.map(q => `
    <article class="question">
      <div class="meta">${escapeHTML(q.year)} · ${escapeHTML(q.paper)} · ${escapeHTML(q.topic)}</div>
      <strong>${escapeHTML(q.question)}</strong>
    </article>
  `).join("");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[c]));
}

(async () => {
  try {
    const [syllabus, questions] = await Promise.all([
      loadJSON("data/syllabus.json"),
      loadJSON("data/questions.json")
    ]);
    document.querySelector("#subjectCount").textContent = syllabus.length;
    document.querySelector("#topicCount").textContent = syllabus.reduce((n, s) => n + s.topics.length, 0);
    document.querySelector("#questionCount").textContent = questions.length;
    renderSyllabus(syllabus);
    renderQuestions(questions);
    document.querySelector("#search").addEventListener("input", e => renderSyllabus(syllabus, e.target.value));
  } catch (error) {
    document.querySelector("#syllabusGrid").innerHTML = "<p>Could not load study data. Open this project through a local web server.</p>";
    console.error(error);
  }
})();
