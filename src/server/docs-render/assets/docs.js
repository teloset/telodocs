document.querySelectorAll(".docs-nav-folder-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const folder = button.closest(".docs-nav-folder");
    if (!folder) {
      return;
    }

    const isOpen = folder.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });
});
