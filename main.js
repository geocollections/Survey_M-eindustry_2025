(function () {
  const modal = document.getElementById("image-modal");
  const modalImage = document.getElementById("image-modal-image");
  const closeButton = document.getElementById("image-modal-close");
  const images = document.querySelectorAll("[data-modal-image]");

  if (!modal || !modalImage || !closeButton || !images.length) return;

  let lastTrigger = null;

  function openModal(image) {
    lastTrigger = image;
    modalImage.src = image.currentSrc || image.src;
    modalImage.alt = image.alt || "";
    modal.hidden = false;
    document.body.classList.add("has-open-modal");
    closeButton.focus();
  }

  function closeModal() {
    modal.hidden = true;
    modalImage.removeAttribute("src");
    document.body.classList.remove("has-open-modal");
    if (lastTrigger) lastTrigger.focus();
  }

  images.forEach((image) => {
    image.setAttribute("tabindex", "0");
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `${image.alt}. Ava suurem vaade`);

    image.addEventListener("click", () => openModal(image));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(image);
      }
    });
  });

  closeButton.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });

}());
