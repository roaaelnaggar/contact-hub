let contacts = []; // Array to store contact objects
let editingId = null; // Variable to track the ID of the contact being edited
let photoData = ""; // Variable to store the base64 data of the contact photo
// Get references to DOM elements
const addContactBtn = document.getElementById("addContactBtn");
const searchInput = document.getElementById("searchInput");
const contactsList = document.getElementById("contactsList");
const favoritesList = document.getElementById("favoritesList");
const emergencyList = document.getElementById("emergencyList");
const contactsSubtitle = document.getElementById("contactsSubtitle");

const totalCount = document.getElementById("totalCount");
const favoritesCount = document.getElementById("favoritesCount");
const emergencyCount = document.getElementById("emergencyCount");

const contactModal = new bootstrap.Modal(document.getElementById("contactModal"));
const modalTitle = document.getElementById("modalTitle");
const saveBtn = document.getElementById("saveBtn");
const saveBtnText = document.getElementById("saveBtnText");
const photoCircle = document.getElementById("photoCircle");
const photoInput = document.getElementById("photoInput");
const photoBtn = document.getElementById("photoBtn");

const nameInput = document.getElementById("nameInput");
const phoneInput = document.getElementById("phoneInput");
const emailInput = document.getElementById("emailInput");
const addressInput = document.getElementById("addressInput");
const groupSelect = document.getElementById("groupSelect");
const notesInput = document.getElementById("notesInput");
const favoriteCheck = document.getElementById("favoriteCheck");
const emergencyCheck = document.getElementById("emergencyCheck");

const nameError = document.getElementById("nameError");
const phoneError = document.getElementById("phoneError");
const emailError = document.getElementById("emailError");

function getInitials(name) {
    const words = name.trim().split(" ");
    let letters = words[0].charAt(0);

    if (words.length > 1) {
        letters = letters + words[words.length - 1].charAt(0);
    }

    return letters.toUpperCase();
}

function getColorNumber(name) {
    return name.length % 6;
}

function escapeText(text) {
    let result = text;
    result = result.replace(/&/g, "&amp;");
    result = result.replace(/</g, "&lt;");
    result = result.replace(/>/g, "&gt;");
    result = result.replace(/"/g, "&quot;");
    return result;
}

function cleanPhone(phone) {
    let result = phone.replace(/[\s-]/g, "");

    if (result.indexOf("+20") === 0) {
        result = "0" + result.substring(3);
    } else if (result.indexOf("0020") === 0) {
        result = "0" + result.substring(4);
    }

    return result;
}

function findIndexById(id) {
    for (let i = 0; i < contacts.length; i++) {
        if (contacts[i].id === id) {
            return i;
        }
    }
    return -1;
}

function findDuplicatePhone(phone, myId) {
    for (let i = 0; i < contacts.length; i++) {
        if (contacts[i].phone === phone && contacts[i].id !== myId) {
            return contacts[i];
        }
    }
    return null;
}

function createAvatar(contact, extraClass) {
    if (contact.photo !== "") {
        return `<img src="${contact.photo}" alt="${escapeText(contact.name)}" class="avatar ${extraClass}">`;
    }

    return `<div class="avatar color-${getColorNumber(contact.name)} ${extraClass}">${getInitials(contact.name)}</div>`;
}

function saveToLocalStorage() {
    localStorage.setItem("contacts", JSON.stringify(contacts));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem("contacts");

    if (saved !== null) {
        contacts = JSON.parse(saved);
    }
}

function searchContacts() {
    const text = searchInput.value.trim().toLowerCase();

    if (text === "") {
        return contacts;
    }

    const result = [];

    for (let i = 0; i < contacts.length; i++) {
        const name = contacts[i].name.toLowerCase();
        const phone = contacts[i].phone.toLowerCase();
        const email = contacts[i].email.toLowerCase();

        if (name.includes(text) || phone.includes(text) || email.includes(text)) {
            result.push(contacts[i]);
        }
    }

    return result;
}

function displayContacts() {
    const list = searchContacts();
    let html = "";

    if (contacts.length === 0) {
        html = `
            <div class="col-12">
                <div class="empty-box">
                    <div class="empty-icon"><i class="bi bi-person-lines-fill"></i></div>
                    <h3>No contacts found</h3>
                    <p>Click "Add Contact" to get started</p>
                </div>
            </div>`;
        contactsList.innerHTML = html;
        return;
    }

    if (list.length === 0) {
        html = `
            <div class="col-12">
                <div class="empty-box">
                    <div class="empty-icon"><i class="bi bi-search"></i></div>
                    <h3>No contacts found</h3>
                    <p>Try a different name, phone number, or email.</p>
                </div>
            </div>`;
        contactsList.innerHTML = html;
        return;
    }

    for (let i = 0; i < list.length; i++) {
        const c = list[i];

        let badges = "";
        if (c.favorite) {
            badges = badges + `<span class="badge-star"><i class="bi bi-star-fill"></i></span>`;
        }
        if (c.emergency) {
            badges = badges + `<span class="badge-heart"><i class="bi bi-heart-pulse-fill"></i></span>`;
        }

        let emailRow = "";
        if (c.email !== "") {
            emailRow = `
                <div class="info-row">
                    <div class="info-icon icon-purple"><i class="bi bi-envelope-fill"></i></div>
                    <span title="${escapeText(c.email)}">${escapeText(c.email)}</span>
                </div>`;
        }

        let addressRow = "";
        if (c.address !== "") {
            addressRow = `
                <div class="info-row">
                    <div class="info-icon icon-green"><i class="bi bi-geo-alt-fill"></i></div>
                    <span title="${escapeText(c.address)}">${escapeText(c.address)}</span>
                </div>`;
        }

        let tags = "";
        if (c.group !== "") {
            tags = tags + `<span class="tag tag-${c.group.toLowerCase()}">${c.group}</span>`;
        }
        if (c.emergency) {
            tags = tags + `<span class="tag tag-emergency"><i class="bi bi-heart-pulse-fill"></i> Emergency</span>`;
        }

        let tagRow = "";
        if (tags !== "") {
            tagRow = `<div class="tag-row">${tags}</div>`;
        }

        let emailButton = "";
        if (c.email !== "") {
            emailButton = `<a href="mailto:${escapeText(c.email)}" class="action-btn mail-action" title="Send email"><i class="bi bi-envelope-fill"></i></a>`;
        } else {
            emailButton = `<button type="button" class="action-btn mail-action" title="Send email" onclick="noEmailMessage()"><i class="bi bi-envelope-fill"></i></button>`;
        }

        let starClass = "action-btn";
        let starIcon = "bi-star";
        if (c.favorite) {
            starClass = "action-btn star-on";
            starIcon = "bi-star-fill";
        }

        let heartClass = "action-btn";
        let heartIcon = "bi-heart";
        if (c.emergency) {
            heartClass = "action-btn heart-on";
            heartIcon = "bi-heart-pulse-fill";
        }

        html = html + `
            <div class="col-md-6">
                <div class="contact-card">

                    <div class="card-top">
                        <div class="avatar-wrap">
                            ${createAvatar(c, "")}
                            ${badges}
                        </div>
                        <div class="card-info">
                            <h3 class="card-name">${escapeText(c.name)}</h3>
                            <div class="info-row info-row-first">
                                <div class="info-icon icon-blue"><i class="bi bi-telephone-fill"></i></div>
                                <span>${c.phone}</span>
                            </div>
                        </div>
                    </div>

                    ${emailRow}
                    ${addressRow}
                    ${tagRow}

                    <div class="card-bottom">
                        <div class="action-group">
                            <a href="tel:${c.phone}" class="action-btn call-action" title="Call"><i class="bi bi-telephone-fill"></i></a>
                            ${emailButton}
                        </div>
                        <div class="action-group">
                            <button type="button" class="${starClass}" title="Favorite" onclick="toggleFavorite(${c.id})"><i class="bi ${starIcon}"></i></button>
                            <button type="button" class="${heartClass}" title="Emergency" onclick="toggleEmergency(${c.id})"><i class="bi ${heartIcon}"></i></button>
                            <button type="button" class="action-btn edit-action" title="Edit" onclick="openEditModal(${c.id})"><i class="bi bi-pencil-fill"></i></button>
                            <button type="button" class="action-btn delete-action" title="Delete" onclick="deleteContact(${c.id})"><i class="bi bi-trash-fill"></i></button>
                        </div>
                    </div>

                </div>
            </div>`;
    }

    contactsList.innerHTML = html;
}

function displayFavorites() {
    let html = "";

    for (let i = 0; i < contacts.length; i++) {
        const c = contacts[i];

        if (c.favorite) {
            html = html + `
                <div class="side-item favorite-item">
                    ${createAvatar(c, "avatar-small")}
                    <div class="side-info">
                        <p class="side-name">${escapeText(c.name)}</p>
                        <p class="side-phone">${c.phone}</p>
                    </div>
                    <a href="tel:${c.phone}" class="call-btn call-green" title="Call"><i class="bi bi-telephone-fill"></i></a>
                </div>`;
        }
    }

    if (html === "") {
        html = `<p class="side-empty">No favorite contacts</p>`;
    }

    favoritesList.innerHTML = html;
}

function displayEmergency() {
    let html = "";

    for (let i = 0; i < contacts.length; i++) {
        const c = contacts[i];

        if (c.emergency) {
            html = html + `
                <div class="side-item emergency-item">
                    ${createAvatar(c, "avatar-small")}
                    <div class="side-info">
                        <p class="side-name">${escapeText(c.name)}</p>
                        <p class="side-phone">${c.phone}</p>
                    </div>
                    <a href="tel:${c.phone}" class="call-btn call-red" title="Call"><i class="bi bi-telephone-fill"></i></a>
                </div>`;
        }
    }

    if (html === "") {
        html = `<p class="side-empty">No emergency contacts</p>`;
    }

    emergencyList.innerHTML = html;
}

function updateStatistics() {
    let favorites = 0;
    let emergency = 0;

    for (let i = 0; i < contacts.length; i++) {
        if (contacts[i].favorite) {
            favorites++;
        }
        if (contacts[i].emergency) {
            emergency++;
        }
    }

    totalCount.textContent = contacts.length;
    favoritesCount.textContent = favorites;
    emergencyCount.textContent = emergency;

    if (contacts.length === 1) {
        contactsSubtitle.textContent = "Manage and organize your 1 contact";
    } else {
        contactsSubtitle.textContent = "Manage and organize your " + contacts.length + " contacts";
    }
}

function refreshPage() {
    displayContacts();
    displayFavorites();
    displayEmergency();
    updateStatistics();
}

function clearErrors() {
    nameInput.classList.remove("is-invalid");
    phoneInput.classList.remove("is-invalid");
    emailInput.classList.remove("is-invalid");
}

function showPhotoPreview() {
    if (photoData !== "") {
        photoCircle.innerHTML = `<img src="${photoData}" alt="Contact photo">`;
    } else {
        photoCircle.innerHTML = `<i class="bi bi-person-fill"></i>`;
    }
}

function openAddModal() {
    editingId = null;
    photoData = "";

    modalTitle.textContent = "Add New Contact";
    saveBtnText.textContent = "Save Contact";

    nameInput.value = "";
    phoneInput.value = "";
    emailInput.value = "";
    addressInput.value = "";
    groupSelect.value = "";
    notesInput.value = "";
    favoriteCheck.checked = false;
    emergencyCheck.checked = false;

    clearErrors();
    showPhotoPreview();
    contactModal.show();
}

function openEditModal(id) {
    const index = findIndexById(id);
    const c = contacts[index];

    editingId = id;
    photoData = c.photo;

    modalTitle.textContent = "Edit Contact";
    saveBtnText.textContent = "Save Changes";

    nameInput.value = c.name;
    phoneInput.value = c.phone;
    emailInput.value = c.email;
    addressInput.value = c.address;
    groupSelect.value = c.group;
    notesInput.value = c.notes;
    favoriteCheck.checked = c.favorite;
    emergencyCheck.checked = c.emergency;

    clearErrors();
    showPhotoPreview();
    contactModal.show();
}

function addContact(newContact) {
    contacts.push(newContact);
    saveToLocalStorage();
    refreshPage();
    contactModal.hide();

    Swal.fire({
        icon: "success",
        title: "Added!",
        text: "Contact has been added successfully.",
        timer: 1800,
        showConfirmButton: false
    });
}

function editContact(updatedContact) {
    const index = findIndexById(editingId);

    contacts[index].name = updatedContact.name;
    contacts[index].phone = updatedContact.phone;
    contacts[index].email = updatedContact.email;
    contacts[index].address = updatedContact.address;
    contacts[index].group = updatedContact.group;
    contacts[index].notes = updatedContact.notes;
    contacts[index].favorite = updatedContact.favorite;
    contacts[index].emergency = updatedContact.emergency;
    contacts[index].photo = updatedContact.photo;

    saveToLocalStorage();
    refreshPage();
    contactModal.hide();

    Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Contact has been updated successfully.",
        timer: 1800,
        showConfirmButton: false
    });
}

function saveContact() {
    const name = nameInput.value.trim();
    const phone = cleanPhone(phoneInput.value);
    const email = emailInput.value.trim();

    const nameRule = /^[A-Za-z\u0600-\u06FF ]{2,50}$/;
    const phoneRule = /^01[0125][0-9]{8}$/;
    const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let isValid = true;
    clearErrors();

    if (name === "") {
        nameError.textContent = "Full name is required";
        nameInput.classList.add("is-invalid");
        isValid = false;
    } else if (nameRule.test(name) === false) {
        nameError.textContent = "Name should contain only letters and spaces (2-50 characters)";
        nameInput.classList.add("is-invalid");
        isValid = false;
    }

    if (phoneInput.value.trim() === "") {
        phoneError.textContent = "Phone number is required";
        phoneInput.classList.add("is-invalid");
        isValid = false;
    } else if (phoneRule.test(phone) === false) {
        phoneError.textContent = "Please enter a valid Egyptian phone number";
        phoneInput.classList.add("is-invalid");
        isValid = false;
    }

    if (email !== "" && emailRule.test(email) === false) {
        emailError.textContent = "Please enter a valid email address";
        emailInput.classList.add("is-invalid");
        isValid = false;
    }

    if (isValid === false) {
        return;
    }

    const duplicate = findDuplicatePhone(phone, editingId);
    if (duplicate !== null) {
        Swal.fire({
            icon: "error",
            title: "Duplicate Phone Number",
            text: "A contact with this phone number already exists: " + duplicate.name,
            confirmButtonColor: "#6d28d9"
        });
        return;
    }

    const contactData = {
        id: Date.now(),
        name: name,
        phone: phone,
        email: email,
        address: addressInput.value.trim(),
        group: groupSelect.value,
        notes: notesInput.value.trim(),
        favorite: favoriteCheck.checked,
        emergency: emergencyCheck.checked,
        photo: photoData
    };

    if (editingId === null) {
        addContact(contactData);
    } else {
        editContact(contactData);
    }
}

function deleteContact(id) {
    const index = findIndexById(id);
    const name = contacts[index].name;

    Swal.fire({
        icon: "warning",
        title: "Delete Contact?",
        text: "Are you sure you want to delete " + name + "? This action cannot be undone.",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#b91c3c",
        cancelButtonColor: "#6b7280"
    }).then(function (result) {
        if (result.isConfirmed) {
            contacts.splice(findIndexById(id), 1);
            saveToLocalStorage();
            refreshPage();

            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Contact has been deleted.",
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}

function toggleFavorite(id) {
    const index = findIndexById(id);

    contacts[index].favorite = !contacts[index].favorite;

    saveToLocalStorage();
    refreshPage();
}

function toggleEmergency(id) {
    const index = findIndexById(id);

    contacts[index].emergency = !contacts[index].emergency;

    saveToLocalStorage();
    refreshPage();
}

function noEmailMessage() {
    Swal.fire({
        icon: "info",
        title: "No Email",
        text: "This contact has no email address. Edit the contact to add one.",
        confirmButtonColor: "#6d28d9"
    });
}

addContactBtn.addEventListener("click", openAddModal);
saveBtn.addEventListener("click", saveContact);

searchInput.addEventListener("input", displayContacts);

nameInput.addEventListener("input", function () {
    nameInput.classList.remove("is-invalid");
});

phoneInput.addEventListener("input", function () {
    phoneInput.classList.remove("is-invalid");
});

emailInput.addEventListener("input", function () {
    emailInput.classList.remove("is-invalid");
});

photoBtn.addEventListener("click", function () {
    photoInput.click();
});

photoInput.addEventListener("change", function () {
    const file = photoInput.files[0];

    if (file === undefined) {
        return;
    }

    if (file.type.indexOf("image") !== 0) {
        Swal.fire({
            icon: "error",
            title: "Wrong File",
            text: "Please choose an image file.",
            confirmButtonColor: "#6d28d9"
        });
        return;
    }

    if (file.size > 200000) {
        Swal.fire({
            icon: "error",
            title: "Photo Too Big",
            text: "Please choose a photo smaller than 200 KB.",
            confirmButtonColor: "#6d28d9"
        });
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        photoData = reader.result;
        showPhotoPreview();
    };

    reader.readAsDataURL(file);
    photoInput.value = "";
});

loadFromLocalStorage();
refreshPage();