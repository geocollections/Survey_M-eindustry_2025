(function () {
  const data = window.SURVEY_DATA || { answers: [], questions: {} };
  const answers = data.answers || [];

  const answerCount = document.getElementById("answer-count");
  const heading = document.getElementById("slide-heading");
  const counter = document.getElementById("counter");
  const progressBar = document.getElementById("progress-bar");
  const carousel = document.querySelector(".carousel");
  const track = document.getElementById("track");
  const viewport = document.getElementById("viewport");
  const ticks = document.getElementById("ticks");
  const randomButton = document.getElementById("random-button");
  const prevButton = document.getElementById("prev-button");
  const nextButton = document.getElementById("next-button");

  let index = 0;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  let turnTimer = 0;
  let direction = 1;

  function densityClass(text) {
    if (text.length > 720) return "is-very-long";
    if (text.length > 420) return "is-long";
    return "";
  }

  function createSlide(answer) {
    const slide = document.createElement("article");
    slide.className = "slide";
    slide.setAttribute("aria-label", `Vastusepaar ${answer.nr}`);

    slide.innerHTML = `
      <div class="answer-pair">
        <section class="answer-card answer-card--challenge">
          <span class="answer-card__label">Küsimus 3</span>
          <h3>Peamine väljakutse</h3>
          <p class="answer-text ${densityClass(answer.q1)}"></p>
        </section>
        <section class="answer-card answer-card--solution">
          <span class="answer-card__label">Küsimus 4</span>
          <h3>Kavandatud või rakendatud lahendus</h3>
          <p class="answer-text ${densityClass(answer.q2)}"></p>
        </section>
      </div>
    `;

    const textNodes = slide.querySelectorAll(".answer-text");
    textNodes[0].textContent = answer.q1;
    textNodes[1].textContent = answer.q2;
    return slide;
  }

  function build() {
    answerCount.textContent = answers.length;
    track.innerHTML = "";
    ticks.innerHTML = "";

    answers.forEach((answer, slideIndex) => {
      track.appendChild(createSlide(answer));

      const tick = document.createElement("button");
      tick.className = "tick";
      tick.type = "button";
      tick.setAttribute("aria-label", `Ava vastusepaar ${slideIndex + 1}`);
      tick.addEventListener("click", () => goTo(slideIndex));
      ticks.appendChild(tick);
    });

    update({ animate: false });
  }

  function update(options = {}) {
    if (!answers.length) return;
    const animate = options.animate !== false;

    if (options.jump) {
      track.classList.add("is-jump");
    }

    track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
    heading.textContent = `Paar ${answers[index].nr}`;
    counter.textContent = `${index + 1} / ${answers.length}`;
    progressBar.style.width = `${((index + 1) / answers.length) * 100}%`;
    carousel.style.setProperty("--turn-offset", `${direction * 20}px`);
    carousel.style.setProperty("--turn-rotation", `${direction * -8}deg`);

    [...track.children].forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });

    [...ticks.children].forEach((tick, tickIndex) => {
      tick.setAttribute("aria-current", tickIndex === index ? "true" : "false");
    });

    if (animate) {
      carousel.classList.remove("is-turning");
      void carousel.offsetWidth;
      carousel.classList.add("is-turning");
      window.clearTimeout(turnTimer);
      turnTimer = window.setTimeout(() => carousel.classList.remove("is-turning"), 540);
    }

    if (options.jump) {
      window.requestAnimationFrame(() => track.classList.remove("is-jump"));
    }
  }

  function goTo(nextIndex, options = {}) {
    const previousIndex = index;
    const clampedIndex = Math.max(0, Math.min(answers.length - 1, nextIndex));
    if (clampedIndex === previousIndex) {
      update({ animate: false });
      return;
    }

    direction = clampedIndex > previousIndex ? 1 : -1;
    index = clampedIndex;
    update(options);
  }

  function moveBy(delta) {
    goTo(index + delta);
  }

  function openRandom() {
    if (answers.length < 2) return;
    let nextIndex = index;
    while (nextIndex === index) {
      nextIndex = Math.floor(Math.random() * answers.length);
    }
    goTo(nextIndex, { jump: true });
  }

  function onPointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    isDragging = true;
    startX = event.clientX;
    currentX = startX;
    track.classList.add("is-dragging");
    viewport.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (!isDragging) return;
    currentX = event.clientX;
    const delta = currentX - startX;
    const width = viewport.clientWidth || 1;
    const offset = (-index * 100) + (delta / width) * 100;
    track.style.transform = `translate3d(${offset}%, 0, 0)`;
  }

  function onPointerUp(event) {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove("is-dragging");
    viewport.releasePointerCapture(event.pointerId);

    const delta = currentX - startX;
    if (Math.abs(delta) > 58) {
      moveBy(delta < 0 ? 1 : -1);
    } else {
      update({ animate: false });
    }
  }

  randomButton.addEventListener("click", openRandom);
  prevButton.addEventListener("click", () => moveBy(-1));
  nextButton.addEventListener("click", () => moveBy(1));
  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointermove", onPointerMove);
  viewport.addEventListener("pointerup", onPointerUp);
  viewport.addEventListener("pointercancel", onPointerUp);

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") moveBy(1);
    if (event.key === "ArrowLeft") moveBy(-1);
  });

  build();
}());
