const state = {
  books: [],
  filteredBooks: [],
  selectedSlug: "",
  selectedBook: null,
  dirty: false,
};

const elements = {
  amazonLink: document.querySelector("#amazonLink"),
  bookList: document.querySelector("#bookList"),
  categoryFilter: document.querySelector("#categoryFilter"),
  coverPath: document.querySelector("#coverPath"),
  coverPreview: document.querySelector("#coverPreview"),
  discardButton: document.querySelector("#discardButton"),
  editorForm: document.querySelector("#editorForm"),
  editorMeta: document.querySelector("#editorMeta"),
  editorTitle: document.querySelector("#editorTitle"),
  emptyState: document.querySelector("#emptyState"),
  filePath: document.querySelector("#filePath"),
  saveButton: document.querySelector("#saveButton"),
  saveState: document.querySelector("#saveState"),
  searchInput: document.querySelector("#searchInput"),
  statusFilter: document.querySelector("#statusFilter"),
};

const editableFieldNames = [
  "impact_blurb",
  "key_idea",
  "lasting_impact",
  "recommended_for",
  "reflection_status",
  "why_this_book_stayed_with_me",
  "what_i_kept_returning_to",
  "where_it_still_shows_up",
  "who_i_would_hand_it_to",
];

const formFields = Object.fromEntries(editableFieldNames.map((name) => [name, elements.editorForm.elements.namedItem(name)]));

function bookLabel(book) {
  return `${book.title || "Untitled"}${book.author ? ` by ${book.author}` : ""}`;
}

function setSaveState(message, variant = "") {
  elements.saveState.textContent = message;
  elements.saveState.className = "save-state";
  if (variant) {
    elements.saveState.classList.add(variant);
  }
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function updateCategoryOptions() {
  const categories = [...new Set(state.books.map((book) => book.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const current = elements.categoryFilter.value;
  elements.categoryFilter.innerHTML = '<option value="">All categories</option>';
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.categoryFilter.appendChild(option);
  });
  elements.categoryFilter.value = categories.includes(current) ? current : "";
}

function applyFilters() {
  const query = normalize(elements.searchInput.value);
  const category = elements.categoryFilter.value;
  const status = elements.statusFilter.value;

  state.filteredBooks = state.books.filter((book) => {
    const matchesQuery =
      !query || normalize(book.title).includes(query) || normalize(book.author).includes(query) || normalize(book.slug).includes(query);
    const matchesCategory = !category || book.category === category;
    const matchesStatus = !status || book.reflection_status === status;
    return matchesQuery && matchesCategory && matchesStatus;
  });

  renderBookList();
}

function renderBookList() {
  elements.bookList.innerHTML = "";

  if (!state.filteredBooks.length) {
    const empty = document.createElement("p");
    empty.className = "sidebar-copy";
    empty.textContent = "No books match the current filters.";
    elements.bookList.appendChild(empty);
    return;
  }

  state.filteredBooks.forEach((book) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "book-list-item";
    if (book.slug === state.selectedSlug) {
      button.classList.add("is-active");
    }

    const title = document.createElement("h3");
    title.textContent = book.title;

    const meta = document.createElement("p");
    meta.textContent = `${book.author || "Unknown author"}${book.category ? ` · ${book.category}` : ""}`;

    const status = document.createElement("span");
    status.className = "status-pill";
    status.textContent = book.reflection_status || "Draft";

    button.append(title, meta, status);
    button.addEventListener("click", () => selectBook(book.slug));
    elements.bookList.appendChild(button);
  });
}

function formPayload() {
  const payload = {};
  editableFieldNames.forEach((name) => {
    payload[name] = formFields[name].value;
  });
  return payload;
}

function markDirty() {
  if (!state.selectedBook) return;
  state.dirty = true;
  setSaveState("Unsaved changes.", "is-dirty");
}

function loadBookIntoForm(book) {
  state.selectedBook = JSON.parse(JSON.stringify(book));
  state.selectedSlug = book.slug;
  state.dirty = false;

  editableFieldNames.forEach((name) => {
    formFields[name].value = book[name] ?? "";
  });
  elements.editorTitle.textContent = book.title || "Untitled";
  elements.editorMeta.textContent = [book.author || "Unknown author", book.category, book.series, book.order ? `#${book.order}` : ""]
    .filter(Boolean)
    .join(" · ");
  elements.filePath.textContent = book.file;
  elements.coverPath.textContent = book.cover_image || "No cover image";
  elements.coverPreview.src = book.cover_image ? `/repo${book.cover_image}` : "";
  elements.coverPreview.alt = bookLabel(book);
  elements.coverPreview.hidden = !book.cover_image;
  elements.amazonLink.hidden = !book.amazon_url;
  elements.amazonLink.href = book.amazon_url || "#";
  elements.emptyState.hidden = true;
  elements.editorForm.hidden = false;
  setSaveState("No changes yet.");
  renderBookList();
}

function selectBook(slug) {
  const next = state.books.find((book) => book.slug === slug);
  if (!next) return;
  loadBookIntoForm(next);
}

async function loadBooks() {
  const response = await fetch("/api/books");
  if (!response.ok) {
    throw new Error("Could not load books");
  }
  const payload = await response.json();
  state.books = payload.books;
  updateCategoryOptions();
  applyFilters();
  if (state.books.length && !state.selectedSlug) {
    selectBook(state.books[0].slug);
  }
}

async function saveCurrentBook() {
  if (!state.selectedSlug) return;
  elements.saveButton.disabled = true;
  setSaveState("Saving...");

  const response = await fetch(`/api/books/${state.selectedSlug}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formPayload()),
  });

  elements.saveButton.disabled = false;

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "Unknown error" }));
    setSaveState(payload.error || "Save failed.");
    return;
  }

  const payload = await response.json();
  const savedBook = payload.book;
  const index = state.books.findIndex((book) => book.slug === savedBook.slug);
  if (index >= 0) {
    state.books[index] = savedBook;
  }
  updateCategoryOptions();
  applyFilters();
  loadBookIntoForm(savedBook);
  setSaveState("Saved to disk.", "is-saved");
}

elements.searchInput.addEventListener("input", applyFilters);
elements.categoryFilter.addEventListener("change", applyFilters);
elements.statusFilter.addEventListener("change", applyFilters);
elements.discardButton.addEventListener("click", () => {
  if (state.selectedSlug) {
    selectBook(state.selectedSlug);
  }
});
elements.editorForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await saveCurrentBook();
});
elements.editorForm.addEventListener("input", markDirty);
elements.editorForm.addEventListener("change", markDirty);

window.addEventListener("keydown", async (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    if (!elements.editorForm.hidden) {
      await saveCurrentBook();
    }
  }
});

loadBooks().catch((error) => {
  elements.bookList.innerHTML = "";
  const message = document.createElement("p");
  message.className = "sidebar-copy";
  message.textContent = error.message;
  elements.bookList.appendChild(message);
});
