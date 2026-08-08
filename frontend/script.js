const API = "http://localhost:3000/api";

let books = [];
let members = [];
let borrowings = [];


// =========================
// INITIAL LOAD
// =========================

document.addEventListener("DOMContentLoaded", () => {
    loadAllData();
});

async function loadAllData() {
    await Promise.all([
        loadBooks(),
        loadMembers(),
        loadBorrowings()
    ]);

    updateDashboard();
}


// =========================
// BOOKS
// =========================

async function loadBooks() {
    try {
        const response = await fetch(`${API}/books`);

        if (!response.ok) {
            throw new Error("Failed to load books");
        }

        books = await response.json();

        renderBooks(books);
        updateDashboard();

    } catch (error) {
        showToast(error.message);
    }
}

function renderBooks(data) {
    const table = document.getElementById("booksTableBody");

    if (data.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    No books found
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = data.map(book => `
        <tr>
            <td>${book.id}</td>
            <td>${escapeHTML(book.title)}</td>
            <td>${escapeHTML(book.author)}</td>
            <td>${escapeHTML(book.category)}</td>
            <td>${book.quantity}</td>
            <td>${book.available_quantity}</td>

            <td>
                <button
                    class="edit-button"
                    onclick="editBook(${book.id})">
                    Edit
                </button>

                <button
                    class="danger-button"
                    onclick="deleteBook(${book.id})">
                    Delete
                </button>
            </td>
        </tr>
    `).join("");
}

function openBookForm(book = null) {

    const isEdit = book !== null;

    document.getElementById("modalContent").innerHTML = `
        <h2>${isEdit ? "Edit Book" : "Add New Book"}</h2>

        <form onsubmit="saveBook(event, ${isEdit ? book.id : "null"})">

            <div class="form-group">
                <label>Title</label>
                <input
                    type="text"
                    id="bookTitle"
                    value="${isEdit ? escapeHTML(book.title) : ""}"
                    required>
            </div>

            <div class="form-group">
                <label>Author</label>
                <input
                    type="text"
                    id="bookAuthor"
                    value="${isEdit ? escapeHTML(book.author) : ""}"
                    required>
            </div>

            <div class="form-group">
                <label>Category</label>
                <input
                    type="text"
                    id="bookCategory"
                    value="${isEdit ? escapeHTML(book.category) : ""}"
                    required>
            </div>

            <div class="form-group">
                <label>Quantity</label>
                <input
                    type="number"
                    id="bookQuantity"
                    min="0"
                    value="${isEdit ? book.quantity : 1}"
                    required>
            </div>

            <button class="form-submit" type="submit">
                ${isEdit ? "Update Book" : "Add Book"}
            </button>

        </form>
    `;

    openModal();
}

function editBook(id) {

    const book = books.find(book => book.id === id);

    if (!book) {
        showToast("Book not found");
        return;
    }

    openBookForm(book);
}

async function saveBook(event, id) {

    event.preventDefault();

    const bookData = {
        title: document.getElementById("bookTitle").value.trim(),
        author: document.getElementById("bookAuthor").value.trim(),
        category: document.getElementById("bookCategory").value.trim(),
        quantity: Number(document.getElementById("bookQuantity").value)
    };

    try {

        const url = id
            ? `${API}/books/${id}`
            : `${API}/books`;

        const method = id ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bookData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Operation failed");
        }

        showToast(data.message);

        closeModal();

        await loadBooks();

    } catch (error) {
        showToast(error.message);
    }
}

async function deleteBook(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this book?"
    );

    if (!confirmed) return;

    try {

        const response = await fetch(
            `${API}/books/${id}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to delete book");
        }

        showToast(data.message);

        await loadBooks();

    } catch (error) {
        showToast(error.message);
    }
}


// =========================
// MEMBERS
// =========================

async function loadMembers() {

    try {

        const response = await fetch(`${API}/members`);

        if (!response.ok) {
            throw new Error("Failed to load members");
        }

        members = await response.json();

        renderMembers(members);

        updateDashboard();

    } catch (error) {
        showToast(error.message);
    }
}

function renderMembers(data) {

    const table = document.getElementById("membersTableBody");

    if (data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    No members found
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = data.map(member => `
        <tr>

            <td>${member.id}</td>

            <td>${escapeHTML(member.name)}</td>

            <td>${escapeHTML(member.email)}</td>

            <td>${escapeHTML(member.phone || "-")}</td>

            <td>

                <button
                    class="edit-button"
                    onclick="editMember(${member.id})">
                    Edit
                </button>

                <button
                    class="danger-button"
                    onclick="deleteMember(${member.id})">
                    Delete
                </button>

            </td>

        </tr>
    `).join("");
}

function openMemberForm(member = null) {

    const isEdit = member !== null;

    document.getElementById("modalContent").innerHTML = `

        <h2>${isEdit ? "Edit Member" : "Add New Member"}</h2>

        <form onsubmit="saveMember(event, ${isEdit ? member.id : "null"})">

            <div class="form-group">

                <label>Name</label>

                <input
                    type="text"
                    id="memberName"
                    value="${isEdit ? escapeHTML(member.name) : ""}"
                    required>

            </div>

            <div class="form-group">

                <label>Email</label>

                <input
                    type="email"
                    id="memberEmail"
                    value="${isEdit ? escapeHTML(member.email) : ""}"
                    required>

            </div>

            <div class="form-group">

                <label>Phone</label>

                <input
                    type="text"
                    id="memberPhone"
                    value="${isEdit ? escapeHTML(member.phone || "") : ""}">

            </div>

            <button class="form-submit" type="submit">
                ${isEdit ? "Update Member" : "Add Member"}
            </button>

        </form>
    `;

    openModal();
}

function editMember(id) {

    const member = members.find(
        member => member.id === id
    );

    if (!member) {
        showToast("Member not found");
        return;
    }

    openMemberForm(member);
}

async function saveMember(event, id) {

    event.preventDefault();

    const memberData = {

        name: document
            .getElementById("memberName")
            .value
            .trim(),

        email: document
            .getElementById("memberEmail")
            .value
            .trim(),

        phone: document
            .getElementById("memberPhone")
            .value
            .trim()

    };

    try {

        const url = id
            ? `${API}/members/${id}`
            : `${API}/members`;

        const method = id ? "PUT" : "POST";

        const response = await fetch(url, {

            method,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(memberData)

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Operation failed"
            );
        }

        showToast(data.message);

        closeModal();

        await loadMembers();

    } catch (error) {

        showToast(error.message);

    }
}

async function deleteMember(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this member?"
    );

    if (!confirmed) return;

    try {

        const response = await fetch(
            `${API}/members/${id}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Failed to delete member"
            );
        }

        showToast(data.message);

        await loadMembers();

    } catch (error) {

        showToast(error.message);

    }
}


// =========================
// BORROWINGS
// =========================

async function loadBorrowings() {

    try {

        const response = await fetch(
            `${API}/borrowings`
        );

        if (!response.ok) {
            throw new Error(
                "Failed to load borrowing records"
            );
        }

        borrowings = await response.json();

        renderBorrowings(borrowings);

        updateDashboard();

    } catch (error) {

        showToast(error.message);

    }
}

function renderBorrowings(data) {

    const table =
        document.getElementById(
            "borrowingsTableBody"
        );

    if (data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    No borrowing records found
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = data.map(record => {

        const statusClass =
            record.status === "Returned"
                ? "status-returned"
                : "status-borrowed";

        const action =
            record.status === "Borrowed"
                ? `
                    <button
                        class="success-button"
                        onclick="returnBook(${record.id})">
                        Return
                    </button>
                `
                : `
                    <span style="color:#16a34a;">
                        Completed
                    </span>
                `;

        return `
            <tr>

                <td>${record.id}</td>

                <td>${escapeHTML(record.book_title)}</td>

                <td>${escapeHTML(record.member_name)}</td>

                <td>${formatDate(record.borrow_date)}</td>

                <td>${formatDate(record.return_date)}</td>

                <td>
                    <span class="${statusClass}">
                        ${record.status}
                    </span>
                </td>

                <td>
                    ${action}
                </td>

            </tr>
        `;

    }).join("");
}

function openBorrowForm() {

    if (books.length === 0) {
        showToast("No books available");
        return;
    }

    if (members.length === 0) {
        showToast("Please add a member first");
        return;
    }

    const availableBooks =
        books.filter(
            book => book.available_quantity > 0
        );

    if (availableBooks.length === 0) {
        showToast(
            "No books are currently available"
        );
        return;
    }

    document.getElementById("modalContent").innerHTML = `

        <h2>Borrow a Book</h2>

        <form onsubmit="borrowBook(event)">

            <div class="form-group">

                <label>Select Book</label>

                <select id="borrowBook" required>

                    <option value="">
                        Choose a book
                    </option>

                    ${availableBooks.map(book => `
                        <option value="${book.id}">
                            ${escapeHTML(book.title)}
                            (${book.available_quantity} available)
                        </option>
                    `).join("")}

                </select>

            </div>

            <div class="form-group">

                <label>Select Member</label>

                <select id="borrowMember" required>

                    <option value="">
                        Choose a member
                    </option>

                    ${members.map(member => `
                        <option value="${member.id}">
                            ${escapeHTML(member.name)}
                            - ${escapeHTML(member.email)}
                        </option>
                    `).join("")}

                </select>

            </div>

            <button
                class="form-submit"
                type="submit">

                Confirm Borrow

            </button>

        </form>
    `;

    openModal();
}

async function borrowBook(event) {

    event.preventDefault();

    const book_id =
        Number(
            document.getElementById(
                "borrowBook"
            ).value
        );

    const member_id =
        Number(
            document.getElementById(
                "borrowMember"
            ).value
        );

    try {

        const response = await fetch(
            `${API}/borrowings`,
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    book_id,
                    member_id
                })

            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Borrow operation failed"
            );
        }

        showToast(data.message);

        closeModal();

        await loadAllData();

    } catch (error) {

        showToast(error.message);

    }
}

async function returnBook(id) {

    const confirmed = confirm(
        "Are you sure you want to return this book?"
    );

    if (!confirmed) return;

    try {

        const response = await fetch(
            `${API}/borrowings/${id}/return`,
            {
                method: "PUT"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Return operation failed"
            );
        }

        showToast(data.message);

        await loadAllData();

    } catch (error) {

        showToast(error.message);

    }
}


// =========================
// DASHBOARD
// =========================

function updateDashboard() {

    document.getElementById(
        "totalBooks"
    ).textContent = books.length;

    document.getElementById(
        "availableBooks"
    ).textContent =
        books.reduce(
            (total, book) =>
                total + Number(book.available_quantity),
            0
        );

    document.getElementById(
        "totalMembers"
    ).textContent = members.length;

    document.getElementById(
        "activeBorrowings"
    ).textContent =
        borrowings.filter(
            record => record.status === "Borrowed"
        ).length;
}


// =========================
// SEARCH
// =========================

function filterBooks() {

    const query =
        document.getElementById(
            "bookSearch"
        ).value.toLowerCase();

    const filtered = books.filter(book =>

        book.title.toLowerCase().includes(query) ||

        book.author.toLowerCase().includes(query) ||

        book.category.toLowerCase().includes(query)

    );

    renderBooks(filtered);
}

function filterMembers() {

    const query =
        document.getElementById(
            "memberSearch"
        ).value.toLowerCase();

    const filtered = members.filter(member =>

        member.name.toLowerCase().includes(query) ||

        member.email.toLowerCase().includes(query) ||

        (member.phone || "")
            .toLowerCase()
            .includes(query)

    );

    renderMembers(filtered);
}

function filterBorrowings() {

    const query =
        document.getElementById(
            "borrowingSearch"
        ).value.toLowerCase();

    const filtered = borrowings.filter(record =>

        record.book_title
            .toLowerCase()
            .includes(query) ||

        record.member_name
            .toLowerCase()
            .includes(query) ||

        record.status
            .toLowerCase()
            .includes(query)

    );

    renderBorrowings(filtered);
}


// =========================
// NAVIGATION
// =========================

function showSection(sectionId, button) {

    document
        .querySelectorAll(".content-section")
        .forEach(section => {

            section.classList.add("hidden");

        });

    document
        .getElementById(sectionId)
        .classList.remove("hidden");

    document
        .querySelectorAll(".tab-button")
        .forEach(btn => {

            btn.classList.remove("active");

        });

    button.classList.add("active");
}


// =========================
// MODAL
// =========================

function openModal() {

    document
        .getElementById("modal")
        .classList.remove("hidden");
}

function closeModal() {

    document
        .getElementById("modal")
        .classList.add("hidden");
}


// =========================
// TOAST
// =========================

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);
}


// =========================
// HELPERS
// =========================

function formatDate(date) {

    if (!date) {
        return "-";
    }

    return new Date(date)
        .toLocaleDateString();
}

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}