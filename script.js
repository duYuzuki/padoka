// Número da Padoka no formato internacional, sem espaços ou símbolos.
const WHATSAPP_NUMBER = "5517997646614";
const WHATSAPP_MESSAGE = "Olá, Padoka! Gostaria de fazer um pedido.";
const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  link.href = whatsappUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
});

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

// Cada página é uma WebP leve gerada a partir do PDF original. O site carrega
// somente a página atual e a próxima, mantendo o visual impresso completo.
const menuPageCount = 9;
const getMenuPageSrc = (page, highQuality = false) => {
  const pageName = String(page).padStart(2, "0");
  return highQuality ? `img/menu-hq/page-${pageName}.jpg` : `img/menu/page-${pageName}.webp`;
};

const setImagePage = (container, image, page) => {
  if (!container || !image) return;
  container.dataset.page = page;
  image.src = getMenuPageSrc(page);
  image.dataset.highQualitySrc = getMenuPageSrc(page, true);
  image.dataset.highQualityLoading = "";
  image.alt = page === 1 ? "Capa do cardápio Padoka" : `Página ${page} do cardápio Padoka`;
  image.loading = page === 1 ? "eager" : "lazy";
};

const menuInlinePage = document.querySelector("#menu-inline-page");
const menuImage = document.querySelector("#menu-page-image");
const menuPageNumber = document.querySelector("#menu-page-number");
const menuPageTotal = document.querySelector("#menu-page-total");
const menuPrevious = document.querySelector("#menu-page-prev");
const menuNext = document.querySelector("#menu-page-next");
let currentMenuPage = 1;

const updateMainMenuPage = (page) => {
  currentMenuPage = Math.min(menuPageCount, Math.max(1, page));
  setImagePage(menuInlinePage, menuImage, currentMenuPage);
  if (menuPageNumber) menuPageNumber.textContent = currentMenuPage;
  if (menuPrevious) menuPrevious.disabled = currentMenuPage === 1;
  if (menuNext) menuNext.disabled = currentMenuPage === menuPageCount;
};

if (menuPageTotal) menuPageTotal.textContent = menuPageCount;
if (menuPrevious) menuPrevious.addEventListener("click", () => updateMainMenuPage(currentMenuPage - 1));
if (menuNext) menuNext.addEventListener("click", () => updateMainMenuPage(currentMenuPage + 1));
updateMainMenuPage(1);

const menuDialog = document.querySelector("#menu-dialog");
const menuOpen = document.querySelector("#menu-open");
const menuClose = document.querySelector("#menu-dialog-close");
const menuExpand = document.querySelector("#menu-dialog-expand");
const flipbookStage = document.querySelector("#flipbook-stage");
const flipbookCurrent = document.querySelector("#flipbook-current-page");
const flipbookCurrentImage = document.querySelector("#flipbook-current-image");
const flipbookNext = document.querySelector("#flipbook-next-page");
const flipbookNextImage = document.querySelector("#flipbook-next-image");
const flipbookPageNumber = document.querySelector("#flipbook-page-number");
const flipbookPreviousButton = document.querySelector("#flipbook-prev");
const flipbookNextButton = document.querySelector("#flipbook-next");

if (
  menuDialog && menuOpen && menuClose && menuExpand && flipbookStage &&
  flipbookCurrent && flipbookCurrentImage && flipbookNext && flipbookNextImage &&
  flipbookPageNumber && flipbookPreviousButton && flipbookNextButton
) {
  let flipbookPage = currentMenuPage;
  let isTurning = false;
  let isExpanded = false;
  let pointerStartX = null;
  let pointerStartY = null;
  let swipeDetected = false;
  let zoomLevel = 1;
  let pinchStartDistance = null;
  let pinchStartZoom = 1;
  let panStart = null;
  const activePointers = new Map();

  const pagePairs = [
    [flipbookCurrent, flipbookCurrentImage],
    [flipbookNext, flipbookNextImage]
  ];

  const syncZoom = () => {
    pagePairs.forEach(([container]) => {
      const page = container.closest(".flipbook-page");
      if (!page) return;
      page.style.setProperty("--page-zoom", zoomLevel);
      page.classList.toggle("is-zoomed", zoomLevel > 1);
    });
  };

  const getCurrentZoomPage = () => flipbookCurrent.closest(".flipbook-page");

  const upgradeCurrentPageForZoom = () => {
    const page = Number(flipbookCurrent.dataset.page);
    const highQualitySrc = flipbookCurrentImage.dataset.highQualitySrc || getMenuPageSrc(page, true);
    if (!page || flipbookCurrentImage.src.endsWith(highQualitySrc)) return;
    if (flipbookCurrentImage.dataset.highQualityLoading === highQualitySrc) return;

    flipbookCurrentImage.dataset.highQualityLoading = highQualitySrc;
    const highQualityImage = new Image();
    highQualityImage.decoding = "async";
    highQualityImage.onload = () => {
      flipbookCurrentImage.dataset.highQualityLoading = "";
      if (Number(flipbookCurrent.dataset.page) === page && zoomLevel > 1) {
        flipbookCurrentImage.src = highQualitySrc;
      }
    };
    highQualityImage.src = highQualitySrc;
  };

  const keepZoomPointInView = (page, focusPoint, oldScroll, oldScrollSize) => {
    if (!page || !focusPoint || !oldScrollSize.width || !oldScrollSize.height) return;
    const bounds = page.getBoundingClientRect();
    const focusX = Math.max(0, Math.min(1, (oldScroll.left + focusPoint.clientX - bounds.left) / oldScrollSize.width));
    const focusY = Math.max(0, Math.min(1, (oldScroll.top + focusPoint.clientY - bounds.top) / oldScrollSize.height));
    page.scrollLeft = focusX * page.scrollWidth - (focusPoint.clientX - bounds.left);
    page.scrollTop = focusY * page.scrollHeight - (focusPoint.clientY - bounds.top);
  };

  const setZoom = (value, focusPoint = null) => {
    const page = getCurrentZoomPage();
    const oldScroll = page ? { left: page.scrollLeft, top: page.scrollTop } : { left: 0, top: 0 };
    const oldScrollSize = page ? { width: page.scrollWidth, height: page.scrollHeight } : { width: 0, height: 0 };
    zoomLevel = Math.min(3, Math.max(1, value));
    syncZoom();
    if (zoomLevel > 1) upgradeCurrentPageForZoom();
    if (zoomLevel > 1 && focusPoint) keepZoomPointInView(page, focusPoint, oldScroll, oldScrollSize);
  };

  const setDialogExpanded = (expanded) => {
    isExpanded = expanded;
    menuDialog.classList.toggle("is-expanded", isExpanded);
    menuExpand.querySelector("span").textContent = isExpanded ? "−" : "⛶";
    menuExpand.setAttribute("aria-label", isExpanded ? "Reduzir cardápio" : "Expandir cardápio");
    menuExpand.title = isExpanded ? "Reduzir cardápio" : "Expandir cardápio";
  };

  const syncFlipbook = (page) => {
    flipbookPage = Math.min(menuPageCount, Math.max(1, page));
    const adjacentPage = flipbookPage < menuPageCount ? flipbookPage + 1 : flipbookPage - 1;
    setImagePage(flipbookCurrent, flipbookCurrentImage, flipbookPage);
    setImagePage(flipbookNext, flipbookNextImage, adjacentPage);
    flipbookPageNumber.textContent = flipbookPage;
    flipbookPreviousButton.disabled = flipbookPage === 1;
    flipbookNextButton.disabled = flipbookPage === menuPageCount;
    syncZoom();
  };

  const finishTurn = (targetPage) => {
    flipbookPage = targetPage;
    const adjacentPage = flipbookPage < menuPageCount ? flipbookPage + 1 : flipbookPage - 1;
    setImagePage(flipbookCurrent, flipbookCurrentImage, flipbookPage);
    setImagePage(flipbookNext, flipbookNextImage, adjacentPage);
    flipbookPageNumber.textContent = flipbookPage;
    flipbookPreviousButton.disabled = flipbookPage === 1;
    flipbookNextButton.disabled = flipbookPage === menuPageCount;
    updateMainMenuPage(flipbookPage);
    flipbookStage.classList.remove("is-turning-next", "is-turning-prev");
    isTurning = false;
    syncZoom();
  };

  const turnPage = (direction) => {
    if (isTurning) return;
    const targetPage = flipbookPage + (direction === "next" ? 1 : -1);
    if (targetPage < 1 || targetPage > menuPageCount) return;

    setZoom(1);
    isTurning = true;
    setImagePage(flipbookNext, flipbookNextImage, targetPage);
    flipbookStage.classList.remove("is-turning-next", "is-turning-prev");
    void flipbookStage.offsetWidth;
    flipbookStage.classList.add(direction === "next" ? "is-turning-next" : "is-turning-prev");
    flipbookStage.addEventListener("animationend", () => finishTurn(targetPage), { once: true });
  };

  const closeMenuDialog = () => {
    if (typeof menuDialog.close === "function") menuDialog.close();
    else menuDialog.removeAttribute("open");
  };

  menuOpen.addEventListener("click", () => {
    syncFlipbook(currentMenuPage);
    setZoom(1);
    setDialogExpanded(!window.matchMedia("(max-width: 840px)").matches);
    if (typeof menuDialog.showModal === "function") menuDialog.showModal();
    else menuDialog.setAttribute("open", "");
  });

  menuClose.addEventListener("click", closeMenuDialog);
  menuExpand.addEventListener("click", () => setDialogExpanded(!isExpanded));
  flipbookPreviousButton.addEventListener("click", () => turnPage("prev"));
  flipbookNextButton.addEventListener("click", () => turnPage("next"));

  flipbookStage.addEventListener("pointerdown", (event) => {
    activePointers.set(event.pointerId, event);

    if (activePointers.size >= 2) {
      const [first, second] = [...activePointers.values()];
      pinchStartDistance = Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
      pinchStartZoom = zoomLevel;
      pointerStartX = null;
      pointerStartY = null;
      panStart = null;
      swipeDetected = true;
      return;
    }

    if (zoomLevel > 1 && event.pointerType === "touch") {
      const page = getCurrentZoomPage();
      panStart = page ? { x: event.clientX, y: event.clientY, left: page.scrollLeft, top: page.scrollTop } : null;
      return;
    }

    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    swipeDetected = false;
  });

  flipbookStage.addEventListener("pointermove", (event) => {
    if (!activePointers.has(event.pointerId)) return;
    activePointers.set(event.pointerId, event);

    if (activePointers.size >= 2 && pinchStartDistance) {
      const [first, second] = [...activePointers.values()];
      const distance = Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
      const center = {
        clientX: (first.clientX + second.clientX) / 2,
        clientY: (first.clientY + second.clientY) / 2
      };
      event.preventDefault();
      setZoom(pinchStartZoom * (distance / pinchStartDistance), center);
      return;
    }

    if (zoomLevel > 1 && panStart && event.pointerType === "touch") {
      const page = getCurrentZoomPage();
      if (!page) return;
      event.preventDefault();
      page.scrollLeft = panStart.left - (event.clientX - panStart.x);
      page.scrollTop = panStart.top - (event.clientY - panStart.y);
    }
  }, { passive: false });

  const finishPointer = (event) => {
    activePointers.delete(event.pointerId);
    if (activePointers.size < 2) pinchStartDistance = null;
    if (activePointers.size > 0) return;

    panStart = null;
    if (zoomLevel > 1 || pointerStartX === null) {
      pointerStartX = null;
      pointerStartY = null;
      return;
    }

    const distance = event.clientX - pointerStartX;
    pointerStartX = null;
    pointerStartY = null;
    if (Math.abs(distance) < 45) return;
    swipeDetected = true;
    turnPage(distance < 0 ? "next" : "prev");
  };

  flipbookStage.addEventListener("pointerup", finishPointer);
  flipbookStage.addEventListener("pointercancel", finishPointer);

  flipbookStage.addEventListener("wheel", (event) => {
    if (!flipbookCurrent.contains(event.target)) return;
    event.preventDefault();
    const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
    const factor = Math.exp(-delta * .0012);
    setZoom(zoomLevel * factor, event);
  }, { passive: false });

  flipbookStage.addEventListener("click", (event) => {
    if (zoomLevel > 1) return;
    if (swipeDetected) {
      swipeDetected = false;
      return;
    }
    const bounds = flipbookStage.getBoundingClientRect();
    const position = event.clientX - bounds.left;
    if (position < bounds.width * .32) turnPage("prev");
    if (position > bounds.width * .68) turnPage("next");
  });

  menuDialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") turnPage("next");
    if (event.key === "ArrowLeft") turnPage("prev");
    if (event.key === "Escape") closeMenuDialog();
  });

  menuDialog.addEventListener("click", (event) => {
    if (event.target === menuDialog) closeMenuDialog();
  });

  menuDialog.addEventListener("close", () => {
    flipbookStage.classList.remove("is-turning-next", "is-turning-prev");
    setDialogExpanded(false);
    setZoom(1);
    isTurning = false;
  });

  syncFlipbook(currentMenuPage);
}
