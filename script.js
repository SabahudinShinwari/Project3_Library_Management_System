const API_URL = "http://localhost:3000";

let token = localStorage.getItem("token");
let currentUser = null;

let books = [];
let members = [];
let borrowings = [];
let userBooks = [];
let userBorrowings = [];

// =====================================================
// INITIALIZATION
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
    if (token) {
        loadCurrentUser();
    } else {
        showLogin();
    }
});

// =====================================================
// AUTHENTICATION
// =====================================================

function showLogin() {
    document.getElementById("loginForm").classList.remove("hidden");
    document.getElementById("registerForm").classList.add("hidden");
}

function showRegister() {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("registerForm").classList.remove("hidden");
}

// =====================================================
// REGISTER
// =====================================================

async function registerUser() {
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    if (!name || !email || !password) {
        showMessage("registerMessage", "Please fill in all fields.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(
                "registerMessage",
                data.error || "Registration failed."
            );
            return;
        }

        showMessage(
            "registerMessage",
            "Registration successful. You can now login."
        );

        document.getElementById("registerName").value = "";
        document.getElementById("registerEmail").value = "";
        document.getElementById("registerPassword").value = "";

        setTimeout(() => {
            showLogin();
        }, 1200);

    } catch (error) {
        showMessage(
            "registerMessage",
            "Unable to connect to server."
        );
    }
}

// =====================================================
// LOGIN
// =====================================================

async function loginUser() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        showMessage(
            "loginMessage",
            "Please enter email and password."
        );
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(
                "loginMessage",
                data.error || "Login failed."
            );
            return;
        }

        token = data.token;
        currentUser = data.user;

        localStorage.setItem("token", token);

        document.getElementById("loginEmail").value = "";
        document.getElementById("loginPassword").value = "";

        openDashboard();

    } catch (error) {
        showMessage(
            "loginMessage",
            "Unable to connect to server."
        );
    }
}

// =====================================================
// LOAD CURRENT USER
// =====================================================

async function loadCurrentUser() {
    try {
        const response = await fetch(
            `${API_URL}/api/user/profile`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            logout();
            return;
        }

        currentUser = await response.json();

        openDashboard();

    } catch (error) {
        logout();
    }
}

// =====================================================
// LOGOUT
// =====================================================

function logout() {
    localStorage.removeItem("token");

    token = null;
    currentUser = null;

    document
        .getElementById("authSection")
        .classList.remove("hidden");

    document
        .getElementById("adminSection")
        .classList.add("hidden");

    document
        .getElementById("userSection")
        .classList.add("hidden");

    showLogin();
}

// =====================================================
// OPEN DASHBOARD
// =====================================================

function openDashboard() {
    document
        .getElementById("authSection")
        .classList.add("hidden");

    if (currentUser && currentUser.role === "admin") {

        document
            .getElementById("adminSection")
            .classList.remove("hidden");

        document
            .getElementById("userSection")
            .classList.add("hidden");

        loadAdminDashboard();

    } else {

        document
            .getElementById("userSection")
            .classList.remove("hidden");

        document
            .getElementById("adminSection")
            .classList.add("hidden");

        loadUserDashboard();
    }
}

// =====================================================
// API HELPER
// =====================================================

async function apiRequest(endpoint, method = "GET", body = null) {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (token) {
        options.headers.Authorization = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(
        `${API_URL}${endpoint}`,
        options
    );

    const data = await response
        .json()
        .catch(() => ({}));

    if (response.status === 401) {
        logout();

        throw new Error(
            "Your session has expired. Please login again."
        );
    }

    if (response.status === 403) {
        throw new Error(
            data.error ||
            "You do not have permission to perform this action."
        );
    }

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Request failed."
        );
    }

    return data;
}

// =====================================================
// ADMIN DASHBOARD
// =====================================================

async function loadAdminDashboard() {
    await loadBooks();
    await loadMembers();
    await loadBorrowings();

    updateStatistics();
}

function updateStatistics() {
    document.getElementById("totalBooks").textContent =
        books.length;

    const available = books.reduce(
        (sum, book) =>
            sum + Number(book.available_quantity || 0),
        0
    );

    document.getElementById("availableBooks").textContent =
        available;

    document.getElementById("totalMembers").textContent =
        members.length;

    const active = borrowings.filter(
        borrowing =>
            borrowing.status === "Borrowed"
    ).length;

    document.getElementById("activeBorrowings").textContent =
        active;
}

// =====================================================
// ADMIN BOOKS
// =====================================================

async function loadBooks() {
    try {
        books = await apiRequest("/api/books");

        displayBooks(books);

    } catch (error) {
        showToast(error.message);
    }
}

function displayBooks(data) {
    const tbody =
        document.getElementById("booksTableBody");

    tbody.innerHTML = "";

    data.forEach(book => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${book.id}</td>

            <td>
                ${escapeHTML(book.title)}
            </td>

            <td>
                ${escapeHTML(book.author)}
            </td>

            <td>
                ${escapeHTML(book.category)}
            </td>

            <td>
                ${book.quantity}
            </td>

            <td>
                ${book.available_quantity}
            </td>

            <td>
                <button
                    class="action-button edit-button"
                    onclick="openBookForm(${book.id})"
                >
                    Edit
                </button>

                <button
                    class="action-button delete-button"
                    onclick="deleteBook(${book.id})"
                >
                    Delete
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function filterBooks() {
    const search =
        document
            .getElementById("bookSearch")
            .value
            .toLowerCase();

    const filtered = books.filter(book =>
        String(book.title)
            .toLowerCase()
            .includes(search) ||

        String(book.author)
            .toLowerCase()
            .includes(search) ||

        String(book.category)
            .toLowerCase()
            .includes(search)
    );

    displayBooks(filtered);
}

// =====================================================
// BOOK FORM
// =====================================================

function openBookForm(id = null) {
    let book = null;

    if (id) {
        book = books.find(
            item => item.id === id
        );
    }

    document
        .getElementById("modalContent")
        .innerHTML = `
            <h2>
                ${book ? "Edit Book" : "Add Book"}
            </h2>

            <input
                id="bookTitle"
                placeholder="Book Title"
                value="${
                    book
                        ? escapeAttribute(book.title)
                        : ""
                }"
            >

            <input
                id="bookAuthor"
                placeholder="Author"
                value="${
                    book
                        ? escapeAttribute(book.author)
                        : ""
                }"
            >

            <input
                id="bookCategory"
                placeholder="Category"
                value="${
                    book
                        ? escapeAttribute(book.category)
                        : ""
                }"
            >

            <input
                id="bookQuantity"
                type="number"
                min="1"
                placeholder="Quantity"
                value="${
                    book
                        ? book.quantity
                        : ""
                }"
            >

            <button
                class="modal-submit"
                onclick="saveBook(${id || "null"})"
            >
                Save Book
            </button>
        `;

    document
        .getElementById("modal")
        .classList.remove("hidden");
}

// =====================================================
// SAVE BOOK
// =====================================================

async function saveBook(id) {
    const title =
        document
            .getElementById("bookTitle")
            .value
            .trim();

    const author =
        document
            .getElementById("bookAuthor")
            .value
            .trim();

    const category =
        document
            .getElementById("bookCategory")
            .value
            .trim();

    const quantity =
        Number(
            document
                .getElementById("bookQuantity")
                .value
        );

    if (!title || !author || !category || quantity <= 0) {
        showToast(
            "Please fill all book fields."
        );
        return;
    }

    try {
        if (id) {

            await apiRequest(
                `/api/books/${id}`,
                "PUT",
                {
                    title,
                    author,
                    category,
                    quantity
                }
            );

            showToast(
                "Book updated successfully."
            );

        } else {

            await apiRequest(
                "/api/books",
                "POST",
                {
                    title,
                    author,
                    category,
                    quantity
                }
            );

            showToast(
                "Book added successfully."
            );
        }

        closeModal();

        await loadBooks();

        updateStatistics();

    } catch (error) {
        showToast(error.message);
    }
}

// =====================================================
// DELETE BOOK
// =====================================================

async function deleteBook(id) {
    if (
        !confirm(
            "Are you sure you want to delete this book?"
        )
    ) {
        return;
    }

    try {
        await apiRequest(
            `/api/books/${id}`,
            "DELETE"
        );

        showToast(
            "Book deleted successfully."
        );

        await loadBooks();

        updateStatistics();

    } catch (error) {
        showToast(error.message);
    }
}

// =====================================================
// ADMIN MEMBERS
// =====================================================

async function loadMembers() {
    try {
        members =
            await apiRequest(
                "/api/members"
            );

        displayMembers(members);

    } catch (error) {
        showToast(error.message);
    }
}

function displayMembers(data) {
    const tbody =
        document.getElementById(
            "membersTableBody"
        );

    tbody.innerHTML = "";

    data.forEach(member => {
        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                ${member.id}
            </td>

            <td>
                ${escapeHTML(member.name)}
            </td>

            <td>
                ${escapeHTML(member.email)}
            </td>

            <td>
                ${escapeHTML(
                    member.phone || ""
                )}
            </td>

            <td>
                <button
                    class="action-button edit-button"
                    onclick="openMemberForm(${member.id})"
                >
                    Edit
                </button>

                <button
                    class="action-button delete-button"
                    onclick="deleteMember(${member.id})"
                >
                    Delete
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function filterMembers() {
    const search =
        document
            .getElementById("memberSearch")
            .value
            .toLowerCase();

    const filtered =
        members.filter(member =>
            String(member.name)
                .toLowerCase()
                .includes(search) ||

            String(member.email)
                .toLowerCase()
                .includes(search) ||

            String(member.phone || "")
                .toLowerCase()
                .includes(search)
        );

    displayMembers(filtered);
}

// =====================================================
// MEMBER FORM
// =====================================================

function openMemberForm(id = null) {
    let member = null;

    if (id) {
        member =
            members.find(
                item => item.id === id
            );
    }

    document
        .getElementById("modalContent")
        .innerHTML = `
            <h2>
                ${member ? "Edit Member" : "Add Member"}
            </h2>

            <input
                id="memberName"
                placeholder="Member Name"
                value="${
                    member
                        ? escapeAttribute(member.name)
                        : ""
                }"
            >

            <input
                id="memberEmail"
                type="email"
                placeholder="Email"
                value="${
                    member
                        ? escapeAttribute(member.email)
                        : ""
                }"
            >

            <input
                id="memberPhone"
                placeholder="Phone"
                value="${
                    member
                        ? escapeAttribute(
                            member.phone || ""
                        )
                        : ""
                }"
            >

            <button
                class="modal-submit"
                onclick="saveMember(${id || "null"})"
            >
                Save Member
            </button>
        `;

    document
        .getElementById("modal")
        .classList.remove("hidden");
}

// =====================================================
// SAVE MEMBER
// =====================================================

async function saveMember(id) {
    const name =
        document
            .getElementById("memberName")
            .value
            .trim();

    const email =
        document
            .getElementById("memberEmail")
            .value
            .trim();

    const phone =
        document
            .getElementById("memberPhone")
            .value
            .trim();

    if (!name || !email) {
        showToast(
            "Name and email are required."
        );
        return;
    }

    try {
        if (id) {

            await apiRequest(
                `/api/members/${id}`,
                "PUT",
                {
                    name,
                    email,
                    phone
                }
            );

            showToast(
                "Member updated successfully."
            );

        } else {

            await apiRequest(
                "/api/members",
                "POST",
                {
                    name,
                    email,
                    phone
                }
            );

            showToast(
                "Member added successfully."
            );
        }

        closeModal();

        await loadMembers();

        updateStatistics();

    } catch (error) {
        showToast(error.message);
    }
}

// =====================================================
// DELETE MEMBER
// =====================================================

async function deleteMember(id) {
    if (
        !confirm(
            "Are you sure you want to delete this member?"
        )
    ) {
        return;
    }

    try {
        await apiRequest(
            `/api/members/${id}`,
            "DELETE"
        );

        showToast(
            "Member deleted successfully."
        );

        await loadMembers();

        updateStatistics();

    } catch (error) {
        showToast(error.message);
    }
}

// =====================================================
// ADMIN BORROWINGS
// =====================================================

async function loadBorrowings() {
    try {
        borrowings =
            await apiRequest(
                "/api/borrowings"
            );

        displayBorrowings(borrowings);

    } catch (error) {
        showToast(error.message);
    }
}

function displayBorrowings(data) {
    const tbody =
        document.getElementById(
            "borrowingsTableBody"
        );

    tbody.innerHTML = "";

    data.forEach(record => {

        /*
         * A borrowing can belong to:
         * 1. A logged-in USER
         * 2. An ADMIN-created MEMBER
         *
         * Backend returns member_name for both.
         * These fallbacks make the frontend safer.
         */

        const borrowerName =
            record.member_name ||
            record.user_name ||
            record.member ||
            record.name ||
            "Unknown";

        const borrowerEmail =
            record.member_email ||
            record.user_email ||
            record.email ||
            "";

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                ${record.id}
            </td>

            <td>
                ${escapeHTML(
                    record.book_title ||
                    record.title ||
                    "Unknown"
                )}
            </td>

            <td>
                ${escapeHTML(
                    borrowerName
                )}
                ${
                    borrowerEmail
                        ? `<br>
                           <small>
                               ${escapeHTML(
                                   borrowerEmail
                               )}
                           </small>`
                        : ""
                }
            </td>

            <td>
                ${formatDate(
                    record.borrow_date
                )}
            </td>

            <td>
                ${formatDate(
                    record.return_date
                )}
            </td>

            <td>
                ${escapeHTML(
                    record.status || ""
                )}
            </td>

            <td>
                ${
                    record.status === "Borrowed"
                        ?
                        `
                        <button
                            class="action-button return-button"
                            onclick="returnBook(${record.id})"
                        >
                            Return
                        </button>
                        `
                        :
                        "-"
                }
            </td>
        `;

        tbody.appendChild(row);
    });
}

function filterBorrowings() {
    const search =
        document
            .getElementById(
                "borrowingSearch"
            )
            .value
            .toLowerCase();

    const filtered =
        borrowings.filter(record => {

            const borrowerName =
                record.member_name ||
                record.user_name ||
                record.member ||
                record.name ||
                "";

            const borrowerEmail =
                record.member_email ||
                record.user_email ||
                record.email ||
                "";

            return (
                String(
                    record.book_title || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(borrowerName)
                    .toLowerCase()
                    .includes(search)

                ||

                String(borrowerEmail)
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    record.status || ""
                )
                    .toLowerCase()
                    .includes(search)
            );
        });

    displayBorrowings(filtered);
}

// =====================================================
// BORROW FORM
// =====================================================

function openBorrowForm() {
    let bookOptions = "";

    books.forEach(book => {
        if (
            Number(
                book.available_quantity
            ) > 0
        ) {
            bookOptions += `
                <option value="${book.id}">
                    ${escapeHTML(book.title)}
                    (${book.available_quantity} available)
                </option>
            `;
        }
    });

    let memberOptions = "";

    members.forEach(member => {
        memberOptions += `
            <option value="${member.id}">
                ${escapeHTML(member.name)}
            </option>
        `;
    });

    document
        .getElementById("modalContent")
        .innerHTML = `
            <h2>
                Borrow Book
            </h2>

            <select id="borrowBookId">
                <option value="">
                    Select Book
                </option>

                ${bookOptions}
            </select>

            <select id="borrowMemberId">
                <option value="">
                    Select Member
                </option>

                ${memberOptions}
            </select>

            <button
                class="modal-submit"
                onclick="saveBorrowing()"
            >
                Borrow Book
            </button>
        `;

    document
        .getElementById("modal")
        .classList.remove("hidden");
}

// =====================================================
// SAVE BORROWING
// =====================================================

async function saveBorrowing() {
    const book_id =
        Number(
            document
                .getElementById(
                    "borrowBookId"
                )
                .value
        );

    const member_id =
        Number(
            document
                .getElementById(
                    "borrowMemberId"
                )
                .value
        );

    if (!book_id || !member_id) {
        showToast(
            "Please select a book and member."
        );
        return;
    }

    try {
        await apiRequest(
            "/api/borrowings",
            "POST",
            {
                book_id,
                member_id
            }
        );

        showToast(
            "Book borrowed successfully."
        );

        closeModal();

        await loadBooks();
        await loadBorrowings();

        updateStatistics();

    } catch (error) {
        showToast(error.message);
    }
}

// =====================================================
// RETURN BOOK - ADMIN
// =====================================================

async function returnBook(id) {
    try {
        await apiRequest(
            `/api/borrowings/${id}/return`,
            "PUT"
        );

        showToast(
            "Book returned successfully."
        );

        await loadBooks();
        await loadBorrowings();

        updateStatistics();

    } catch (error) {
        showToast(error.message);
    }
}

// =====================================================
// USER DASHBOARD
// =====================================================

async function loadUserDashboard() {
    try {
        const profile =
            await apiRequest(
                "/api/user/profile"
            );

        currentUser = profile;

        document
            .getElementById("userName")
            .textContent =
            profile.name || "User";

        document
            .getElementById("profileName")
            .textContent =
            profile.name || "User";

        document
            .getElementById("profileEmail")
            .textContent =
            profile.email || "";

        document
            .getElementById("profileRole")
            .textContent =
            profile.role || "user";

        await loadUserBooks();
        await loadUserBorrowings();

    } catch (error) {
        showToast(error.message);
    }
}

// =====================================================
// USER BOOKS
// =====================================================

async function loadUserBooks() {
    try {
        userBooks =
            await apiRequest(
                "/api/user/books"
            );

        displayUserBooks(
            userBooks
        );

    } catch (error) {
        showToast(error.message);
    }
}

function displayUserBooks(data) {
    const grid =
        document.getElementById(
            "userBooksGrid"
        );

    grid.innerHTML = "";

    data.forEach(book => {
        const card =
            document.createElement("div");

        card.className =
            "book-card";

        card.innerHTML = `
            <h3>
                📖 ${escapeHTML(
                    book.title
                )}
            </h3>

            <p>
                <strong>Author:</strong>
                ${escapeHTML(
                    book.author
                )}
            </p>

            <p>
                <strong>Category:</strong>
                ${escapeHTML(
                    book.category
                )}
            </p>

            <p>
                <strong>Available:</strong>
                ${book.available_quantity}
            </p>

            <button
                class="borrow-button"
                onclick="borrowAsUser(${book.id})"
                ${
                    Number(
                        book.available_quantity
                    ) <= 0
                        ? "disabled"
                        : ""
                }
            >
                Borrow Book
            </button>
        `;

        grid.appendChild(card);
    });
}

// =====================================================
// FILTER USER BOOKS
// =====================================================

function filterUserBooks() {
    const search =
        document
            .getElementById(
                "userBookSearch"
            )
            .value
            .toLowerCase();

    const filtered =
        userBooks.filter(book =>
            String(book.title)
                .toLowerCase()
                .includes(search) ||

            String(book.author)
                .toLowerCase()
                .includes(search) ||

            String(book.category)
                .toLowerCase()
                .includes(search)
        );

    displayUserBooks(
        filtered
    );
}

// =====================================================
// USER BORROW
// =====================================================

async function borrowAsUser(bookId) {
    try {
        await apiRequest(
            "/api/user/borrow",
            "POST",
            {
                book_id: bookId
            }
        );

        showToast(
            "Book borrowed successfully."
        );

        await loadUserBooks();
        await loadUserBorrowings();

    } catch (error) {
        showToast(error.message);
    }
}

// =====================================================
// USER BORROWINGS
// =====================================================

async function loadUserBorrowings() {
    try {
        userBorrowings =
            await apiRequest(
                "/api/user/borrowings"
            );

        displayUserBorrowings(
            userBorrowings
        );

    } catch (error) {
        showToast(error.message);
    }
}

function displayUserBorrowings(data) {
    const tbody =
        document.getElementById(
            "userBorrowingsTableBody"
        );

    tbody.innerHTML = "";

    data.forEach(record => {
        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                ${record.id}
            </td>

            <td>
                ${escapeHTML(
                    record.book_title ||
                    record.title ||
                    "Unknown"
                )}
            </td>

            <td>
                ${escapeHTML(
                    record.author ||
                    "Unknown"
                )}
            </td>

            <td>
                ${formatDate(
                    record.borrow_date
                )}
            </td>

            <td>
                ${formatDate(
                    record.return_date
                )}
            </td>

            <td>
                ${escapeHTML(
                    record.status || ""
                )}
            </td>

            <td>
                ${
                    record.status === "Borrowed"
                        ?
                        `
                        <button
                            class="action-button return-button"
                            onclick="returnMyBook(${record.id})"
                        >
                            Return
                        </button>
                        `
                        :
                        "-"
                }
            </td>
        `;

        tbody.appendChild(row);
    });
}

// =====================================================
// USER RETURN
// =====================================================

async function returnMyBook(id) {
    try {
        await apiRequest(
            `/api/user/borrowings/${id}/return`,
            "PUT"
        );

        showToast(
            "Book returned successfully."
        );

        await loadUserBooks();
        await loadUserBorrowings();

    } catch (error) {
        showToast(error.message);
    }
}

// =====================================================
// NAVIGATION
// =====================================================

function showSection(sectionId, button) {
    const sections =
        document.querySelectorAll(
            "#adminSection .content-section"
        );

    sections.forEach(section => {
        section.classList.add("hidden");
    });

    document
        .getElementById(sectionId)
        .classList.remove("hidden");

    const buttons =
        document.querySelectorAll(
            "#adminSection .tab-button"
        );

    buttons.forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");
}

function showUserSection(sectionId, button) {
    const sections =
        document.querySelectorAll(
            "#userSection .content-section"
        );

    sections.forEach(section => {
        section.classList.add("hidden");
    });

    document
        .getElementById(sectionId)
        .classList.remove("hidden");

    const buttons =
        document.querySelectorAll(
            "#userSection .tab-button"
        );

    buttons.forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");
}

// =====================================================
// MODAL
// =====================================================

function closeModal() {
    document
        .getElementById("modal")
        .classList.add("hidden");

    document
        .getElementById("modalContent")
        .innerHTML = "";
}

// =====================================================
// TOAST / MESSAGE
// =====================================================

function showToast(message) {
    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function showMessage(elementId, message) {
    const element =
        document.getElementById(elementId);

    element.textContent = message;
}

// =====================================================
// DATE FORMAT
// =====================================================

function formatDate(date) {
    if (!date) {
        return "-";
    }

    return new Date(date)
        .toLocaleDateString();
}

// =====================================================
// SECURITY HELPERS
// =====================================================

function escapeHTML(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHTML(value);
}