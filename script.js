/* =====================================================
   TECHZONE STORE
   FRONTEND JAVASCRIPT
===================================================== */


/* =====================================================
   GOOGLE APPS SCRIPT WEB APP URL
===================================================== */

const API_URL =
    "https://script.google.com/macros/s/AKfycbzBBbqavwop_dfHRI89dDE6ddXafQK_suaUbMhOvuA2HSRgwFXlbBlgEsirEpTTHIuC/exec";


/* =====================================================
   STATE
===================================================== */

let state = {

    token: "",

    role: "",

    email: "",

    fullName: "",

    products: [],

    categories: []

};


let pendingVerification = "";

let pendingAction = null;


/* =====================================================
   DOM
===================================================== */

const $ = id =>
    document.getElementById(id);


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        $("adminForm")
            .addEventListener(
                "submit",
                adminLogin
            );


        $("customerForm")
            .addEventListener(
                "submit",
                customerLogin
            );


        $("registerForm")
            .addEventListener(
                "submit",
                registerCustomer
            );


        $("verificationForm")
            .addEventListener(
                "submit",
                verifyCode
            );


        $("searchInput")
            .addEventListener(
                "input",
                renderProducts
            );


        $("categoryFilter")
            .addEventListener(
                "change",
                renderProducts
            );

    }
);


/* =====================================================
   API REQUEST
===================================================== */

async function api(
    action,
    data = {}
) {

    if (
        !API_URL ||
        API_URL.includes(
            "PASTE_YOUR"
        )
    ) {

        throw new Error(
            "Please set your Google Apps Script Web App URL in script.js."
        );

    }


    const response =
        await fetch(
            API_URL,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body:
                    JSON.stringify({

                        action,

                        ...data

                    })

            }
        );


    const result =
        await response.json();


    if (
        !result.success
    ) {

        throw new Error(
            result.message ||
            "Something went wrong."
        );

    }


    return result;

}


/* =====================================================
   AUTH TABS
===================================================== */

function showAuth(
    type
) {

    $("adminForm")
        .classList
        .add("hidden");

    $("customerForm")
        .classList
        .add("hidden");

    $("registerForm")
        .classList
        .add("hidden");

    $("verificationForm")
        .classList
        .add("hidden");


    $("adminTab")
        .classList
        .remove("active");

    $("customerTab")
        .classList
        .remove("active");

    $("registerTab")
        .classList
        .remove("active");


    if (
        type === "admin"
    ) {

        $("adminForm")
            .classList
            .remove("hidden");

        $("adminTab")
            .classList
            .add("active");

    }


    if (
        type === "customer"
    ) {

        $("customerForm")
            .classList
            .remove("hidden");

        $("customerTab")
            .classList
            .add("active");

    }


    if (
        type === "register"
    ) {

        $("registerForm")
            .classList
            .remove("hidden");

        $("registerTab")
            .classList
            .add("active");

    }

}


/* =====================================================
   ADMIN LOGIN
===================================================== */

async function adminLogin(
    event
) {

    event.preventDefault();


    const email =
        $("adminEmail")
            .value
            .trim();


    const password =
        $("adminPassword")
            .value;


    try {

        showLoading(
            "Sending verification code..."
        );


        const result =
            await api(
                "adminLogin",
                {
                    email,
                    password
                }
            );


        pendingVerification =
            "admin";


        showVerification(
            email
        );


        toast(
            result.message
        );

    }

    catch (error) {

        toast(
            error.message,
            true
        );

    }

}


/* =====================================================
   CUSTOMER LOGIN
===================================================== */

async function customerLogin(
    event
) {

    event.preventDefault();


    const email =
        $("customerEmail")
            .value
            .trim();


    const password =
        $("customerPassword")
            .value;


    try {

        const result =
            await api(
                "customerLogin",
                {
                    email,
                    password
                }
            );


        pendingVerification =
            "customer";


        showVerification(
            email
        );


        toast(
            result.message
        );

    }

    catch (error) {

        toast(
            error.message,
            true
        );

    }

}


/* =====================================================
   REGISTER CUSTOMER
===================================================== */

async function registerCustomer(
    event
) {

    event.preventDefault();


    const fullName =
        $("registerName")
            .value
            .trim();


    const email =
        $("registerEmail")
            .value
            .trim();


    const password =
        $("registerPassword")
            .value;


    try {

        const result =
            await api(
                "registerCustomer",
                {
                    fullName,
                    email,
                    password
                }
            );


        pendingVerification =
            "register";


        showVerification(
            email
        );


        toast(
            result.message
        );

    }

    catch (error) {

        toast(
            error.message,
            true
        );

    }

}


/* =====================================================
   SHOW VERIFICATION
===================================================== */

function showVerification(
    email
) {

    $("adminForm")
        .classList
        .add("hidden");

    $("customerForm")
        .classList
        .add("hidden");

    $("registerForm")
        .classList
        .add("hidden");


    $("verificationForm")
        .classList
        .remove("hidden");


    $("verificationEmail")
        .textContent =
        email;


    $("verificationCode")
        .value = "";


    $("verificationCode")
        .focus();

}


/* =====================================================
   VERIFY CODE
===================================================== */

async function verifyCode(
    event
) {

    event.preventDefault();


    const email =
        $("verificationEmail")
            .textContent;


    const code =
        $("verificationCode")
            .value
            .trim();


    try {

        let result;


        if (
            pendingVerification ===
            "admin"
        ) {

            result =
                await api(
                    "verifyAdmin",
                    {
                        email,
                        code
                    }
                );

        }


        else if (
            pendingVerification ===
            "customer"
        ) {

            result =
                await api(
                    "verifyCustomer",
                    {
                        email,
                        code
                    }
                );

        }


        else if (
            pendingVerification ===
            "register"
        ) {

            result =
                await api(
                    "verifyCustomerRegistration",
                    {
                        email,
                        code
                    }
                );


            toast(
                "Account successfully created."
            );


            showAuth(
                "customer"
            );


            return;

        }


        state.token =
            result.token;

        state.role =
            result.role;

        state.email =
            result.email;

        state.fullName =
            result.fullName;


        openStore();

    }

    catch (error) {

        toast(
            error.message,
            true
        );

    }

}


/* =====================================================
   BACK TO LOGIN
===================================================== */

function backToLogin() {

    $("verificationForm")
        .classList
        .add("hidden");


    if (
        pendingVerification ===
        "customer"
    ) {

        showAuth(
            "customer"
        );

    }

    else if (
        pendingVerification ===
        "register"
    ) {

        showAuth(
            "register"
        );

    }

    else {

        showAuth(
            "admin"
        );

    }

}


/* =====================================================
   OPEN STORE
===================================================== */

async function openStore() {

    $("authPage")
        .classList
        .add("hidden");


    $("storePage")
        .classList
        .remove("hidden");


    $("loggedUser")
        .textContent =
        state.fullName;


    $("accountRole")
        .textContent =
        state.role === "admin"
            ? "Administrator"
            : "Customer";


    if (
        state.role === "admin"
    ) {

        $("adminPanel")
            .classList
            .remove("hidden");

    }

    else {

        $("adminPanel")
            .classList
            .add("hidden");

    }


    await loadStore();

}


/* =====================================================
   LOAD STORE
===================================================== */

async function loadStore() {

    try {

        const result =
            await api(
                "getDashboard",
                {
                    token:
                        state.token
                }
            );


        state.products =
            result.products;


        state.categories =
            result.categories;


        renderCategories();

        renderFilters();

        renderProducts();

    }

    catch (error) {

        toast(
            error.message,
            true
        );

    }

}


/* =====================================================
   RENDER FILTERS
===================================================== */

function renderFilters() {

    const filter =
        $("categoryFilter");


    filter.innerHTML =
        `<option value="">
            All Categories
        </option>`;


    state.categories
        .forEach(
            category => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    category.categoryName;


                option.textContent =
                    category.categoryName;


                filter.appendChild(
                    option
                );

            }
        );


    const productCategory =
        $("productCategory");


    productCategory.innerHTML =
        "";


    state.categories
        .forEach(
            category => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    category.categoryName;


                option.textContent =
                    category.categoryName;


                productCategory
                    .appendChild(
                        option
                    );

            }
        );

}


/* =====================================================
   RENDER PRODUCTS
===================================================== */

function renderProducts() {

    const search =
        $("searchInput")
            .value
            .toLowerCase()
            .trim();


    const category =
        $("categoryFilter")
            .value
            .toLowerCase();


    const products =
        state.products
            .filter(
                product => {

                    const text =
                        (
                            product.name +
                            " " +
                            product.category +
                            " " +
                            product.description
                        )
                        .toLowerCase();


                    const matchesSearch =
                        text.includes(
                            search
                        );


                    const matchesCategory =
                        !category ||
                        product.category
                            .toLowerCase() ===
                        category;


                    return (
                        matchesSearch &&
                        matchesCategory
                    );

                }
            );


    $("productCount")
        .textContent =
        `${products.length} product${
            products.length === 1
                ? ""
                : "s"
        }`;


    if (
        products.length === 0
    ) {

        $("productsGrid")
            .innerHTML =
            `
                <div class="empty-products">
                    No products found.
                </div>
            `;

        return;

    }


    $("productsGrid")
        .innerHTML =
        products
            .map(
                createProductCard
            )
            .join("");

}


/* =====================================================
   PRODUCT CARD
===================================================== */

function createProductCard(
    product
) {

    const image =
        product.imageUrl
            ? `
                <img
                    src="${escapeHTML(
                        product.imageUrl
                    )}"
                    alt="${escapeHTML(
                        product.name
                    )}"
                    onerror="
                        this.style.display='none';
                    ">
              `
            : `
                <div class="image-placeholder">
                    TZ
                </div>
              `;


    let adminButtons = "";


    if (
        state.role === "admin"
    ) {

        adminButtons =
            `
                <div class="product-actions">

                    <button
                        onclick="
                            editProduct(
                                '${escapeHTML(
                                    product.productId
                                )}'
                            )
                        ">
                        Edit
                    </button>

                    <button
                        onclick="
                            requestDeleteProduct(
                                '${escapeHTML(
                                    product.productId
                                )}'
                            )
                        ">
                        Delete
                    </button>

                </div>
            `;

    }


    return `
        <article class="product-card">

            <div class="product-image">
                ${image}
            </div>


            <div class="product-content">

                <div class="product-category">
                    ${escapeHTML(
                        product.category
                    )}
                </div>


                <h3 class="product-name">
                    ${escapeHTML(
                        product.name
                    )}
                </h3>


                <div class="product-price">
                    ₱${Number(
                        product.price
                    ).toLocaleString(
                        "en-PH",
                        {
                            minimumFractionDigits:
                                2
                        }
                    )}
                </div>


                <div class="product-stock">

                    ${
                        Number(
                            product.quantity
                        ) > 0

                        ? `${product.quantity} in stock`

                        : "Out of stock"

                    }

                </div>


                <p class="product-description">
                    ${escapeHTML(
                        product.description
                    )}
                </p>


                ${adminButtons}

            </div>

        </article>
    `;

}


/* =====================================================
   SAVE PRODUCT
===================================================== */

function saveProduct() {

    const product = {

        productId:
            $("productId")
                .value,

        name:
            $("productName")
                .value
                .trim(),

        category:
            $("productCategory")
                .value,

        price:
            Number(
                $("productPrice")
                    .value
            ),

        quantity:
            Number(
                $("productQuantity")
                    .value
            ),

        imageUrl:
            $("productImage")
                .value
                .trim(),

        description:
            $("productDescription")
                .value
                .trim()

    };


    if (
        !product.name
    ) {

        toast(
            "Product name is required.",
            true
        );

        return;

    }


    if (
        !product.category
    ) {

        toast(
            "Please select a category.",
            true
        );

        return;

    }


    if (
        isNaN(product.price) ||
        product.price < 0
    ) {

        toast(
            "Invalid price.",
            true
        );

        return;

    }


    if (
        isNaN(product.quantity) ||
        product.quantity < 0
    ) {

        toast(
            "Invalid quantity.",
            true
        );

        return;

    }


    pendingAction = {

        type:
            product.productId
                ? "updateProduct"
                : "addProduct",

        data:
            product

    };


    openPasscode();

}


/* =====================================================
   EDIT PRODUCT
===================================================== */

function editProduct(
    id
) {

    const product =
        state.products
            .find(
                item =>
                    item.productId === id
            );


    if (!product) {
        return;
    }


    $("productId")
        .value =
        product.productId;


    $("productName")
        .value =
        product.name;


    $("productCategory")
        .value =
        product.category;


    $("productPrice")
        .value =
        product.price;


    $("productQuantity")
        .value =
        product.quantity;


    $("productImage")
        .value =
        product.imageUrl;


    $("productDescription")
        .value =
        product.description;


    $("adminPanel")
        .scrollIntoView({
            behavior:
                "smooth"
        });

}


/* =====================================================
   CLEAR PRODUCT FORM
===================================================== */

function clearProductForm() {

    $("productId")
        .value = "";

    $("productName")
        .value = "";

    $("productPrice")
        .value = "";

    $("productQuantity")
        .value = "";

    $("productImage")
        .value = "";

    $("productDescription")
        .value = "";

}


/* =====================================================
   DELETE PRODUCT
===================================================== */

function requestDeleteProduct(
    id
) {

    if (
        !confirm(
            "Delete this product?"
        )
    ) {

        return;

    }


    pendingAction = {

        type:
            "deleteProduct",

        data:
            id

    };


    openPasscode();

}


/* =====================================================
   ADD CATEGORY
===================================================== */

function addCategory() {

    const name =
        $("newCategory")
            .value
            .trim();


    if (!name) {

        toast(
            "Enter a category name.",
            true
        );

        return;

    }


    pendingAction = {

        type:
            "addCategory",

        data:
            name

    };


    openPasscode();

}


/* =====================================================
   RENDER CATEGORIES
===================================================== */

function renderCategories() {

    const list =
        $("categoryList");


    list.innerHTML = "";


    state.categories
        .forEach(
            category => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "category-item";


                item.innerHTML =
                    `
                        <span>
                            ${escapeHTML(
                                category.categoryName
                            )}
                        </span>

                        <div
                            class="category-buttons">

                            <button
                                onclick="
                                    editCategory(
                                        '${escapeHTML(
                                            category.categoryId
                                        )}'
                                    )
                                ">
                                Edit
                            </button>

                            <button
                                onclick="
                                    requestDeleteCategory(
                                        '${escapeHTML(
                                            category.categoryId
                                        )}'
                                    )
                                ">
                                Delete
                            </button>

                        </div>
                    `;


                list.appendChild(
                    item
                );

            }
        );

}


/* =====================================================
   EDIT CATEGORY
===================================================== */

function editCategory(
    id
) {

    const category =
        state.categories
            .find(
                item =>
                    item.categoryId === id
            );


    if (!category) {
        return;
    }


    const newName =
        prompt(
            "New category name:",
            category.categoryName
        );


    if (
        newName === null
    ) {

        return;

    }


    if (
        !newName.trim()
    ) {

        toast(
            "Category name cannot be empty.",
            true
        );

        return;

    }


    pendingAction = {

        type:
            "updateCategory",

        id:
            id,

        data:
            newName.trim()

    };


    openPasscode();

}


/* =====================================================
   DELETE CATEGORY
===================================================== */

function requestDeleteCategory(
    id
) {

    if (
        !confirm(
            "Delete this category?"
        )
    ) {

        return;

    }


    pendingAction = {

        type:
            "deleteCategory",

        data:
            id

    };


    openPasscode();

}


/* =====================================================
   PASSCODE
===================================================== */

function openPasscode() {

    $("adminPasscode")
        .value = "";


    $("passcodeModal")
        .classList
        .remove("hidden");


    $("adminPasscode")
        .focus();

}


function closePasscode() {

    pendingAction =
        null;


    $("passcodeModal")
        .classList
        .add("hidden");

}


/* =====================================================
   CONFIRM PASSCODE
===================================================== */

async function confirmPasscode() {

    const passcode =
        $("adminPasscode")
            .value;


    if (!passcode) {

        toast(
            "Enter the admin passcode.",
            true
        );

        return;

    }


    if (!pendingAction) {

        closePasscode();

        return;

    }


    try {

        let result;


        switch (
            pendingAction.type
        ) {

            case "addProduct":

                result =
                    await api(
                        "addProduct",
                        {

                            token:
                                state.token,

                            passcode,

                            product:
                                pendingAction.data

                        }
                    );

                break;


            case "updateProduct":

                result =
                    await api(
                        "updateProduct",
                        {

                            token:
                                state.token,

                            passcode,

                            product:
                                pendingAction.data

                        }
                    );

                break;


            case "deleteProduct":

                result =
                    await api(
                        "deleteProduct",
                        {

                            token:
                                state.token,

                            passcode,

                            productId:
                                pendingAction.data

                        }
                    );

                break;


            case "addCategory":

                result =
                    await api(
                        "addCategory",
                        {

                            token:
                                state.token,

                            passcode,

                            categoryName:
                                pendingAction.data

                        }
                    );

                break;


            case "updateCategory":

                result =
                    await api(
                        "updateCategory",
                        {

                            token:
                                state.token,

                            passcode,

                            categoryId:
                                pendingAction.id,

                            newName:
                                pendingAction.data

                        }
                    );

                break;


            case "deleteCategory":

                result =
                    await api(
                        "deleteCategory",
                        {

                            token:
                                state.token,

                            passcode,

                            categoryId:
                                pendingAction.data

                        }
                    );

                break;

        }


        closePasscode();


        clearProductForm();


        $("newCategory")
            .value = "";


        await loadStore();


        toast(
            "Action completed successfully."
        );

    }

    catch (error) {

        toast(
            error.message,
            true
        );

    }

}


/* =====================================================
   LOGOUT
===================================================== */

async function logout() {

    try {

        await api(
            "logout",
            {
                token:
                    state.token
            }
        );

    }

    catch (error) {}


    state = {

        token: "",

        role: "",

        email: "",

        fullName: "",

        products: [],

        categories: []

    };


    $("storePage")
        .classList
        .add("hidden");


    $("authPage")
        .classList
        .remove("hidden");


    showAuth(
        "admin"
    );

}


/* =====================================================
   TOAST
===================================================== */

function toast(
    message,
    error = false
) {

    const item =
        document.createElement(
            "div"
        );


    item.className =
        "toast" +
        (
            error
                ? " error"
                : ""
        );


    item.textContent =
        message;


    $("toastContainer")
        .appendChild(
            item
        );


    setTimeout(
        () => {

            item.remove();

        },
        3500
    );

}


/* =====================================================
   LOADING
===================================================== */

function showLoading(
    message
) {

    toast(
        message
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}howToast(
            "Registration successful."
        );

        document
            .getElementById(
                "customerEmail"
            )
            .value = email;

        showCustomerLogin();

    } else {

        showToast(
            result.message
        );

    }

}


/* ================= SEND CUSTOMER OTP ================= */

async function sendCustomerOTP() {

    const email =
        document.getElementById(
            "customerEmail"
        ).value.trim();

    if (!email) {

        showToast(
            "Enter your email."
        );

        return;
    }


    showToast(
        "Sending OTP..."
    );


    const result =
        await api(
            "sendCustomerOTP",
            {
                email
            }
        );


    if (result.success) {

        document
            .getElementById(
                "customerLoginStep"
            )
            .classList.add("hidden");

        document
            .getElementById(
                "customerOTPStep"
            )
            .classList.remove("hidden");

        showToast(
            "OTP sent to your Gmail."
        );

    } else {

        showToast(
            result.message
        );

    }

}


/* ================= VERIFY CUSTOMER ================= */

async function verifyCustomerOTP() {

    const email =
        document.getElementById(
            "customerEmail"
        ).value.trim();

    const otp =
        document.getElementById(
            "customerOTP"
        ).value.trim();


    const result =
        await api(
            "verifyCustomerOTP",
            {
                email,
                otp
            }
        );


    if (result.success) {

        customerLoggedIn = true;

        closeModals();

        showPage(
            "products"
        );

        showToast(
            "Customer login successful. View-only mode."
        );

    } else {

        showToast(
            result.message
        );

    }

}


/* ================= ADMIN PRODUCTS ================= */

function renderAdminProducts() {

    const table =
        document.getElementById(
            "adminProductTable"
        );

    if (!table) return;


    if (!adminLoggedIn) {

        table.innerHTML = `
            <tr>
                <td colspan="6">
                    Admin login required.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        products.map(
            product => {

                return `

                    <tr>

                        <td>
                            <strong>
                                ${escapeHTML(product.Name)}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(product.Category)}
                        </td>

                        <td>
                            ₱${formatPrice(product.Price)}
                        </td>

                        <td>
                            ${product.Stock}
                        </td>

                        <td>
                            ${escapeHTML(product.Status)}
                        </td>

                        <td>

                            <button
                                class="table-btn edit-btn"
                                onclick="requestEditProduct('${escapeHTML(product.ProductID)}')"
                            >
                                Edit
                            </button>

                            <button
                                class="table-btn delete-btn"
                                onclick="requestDeleteProduct('${escapeHTML(product.ProductID)}')"
                            >
                                Delete
                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/* ================= DASHBOARD ================= */

function updateDashboard() {

    const totalProducts =
        document.getElementById(
            "totalProducts"
        );

    const totalCategories =
        document.getElementById(
            "totalCategories"
        );

    if (totalProducts) {

        totalProducts.textContent =
            products.length;

    }

    if (totalCategories) {

        totalCategories.textContent =
            categories.length;

    }

}


/* ================= ADD PRODUCT MODAL ================= */

function openProductModal() {

    if (!adminLoggedIn) {

        showToast(
            "Admin login required."
        );

        return;
    }

    clearProductForm();

    document
        .getElementById(
            "productModalTitle"
        )
        .textContent =
        "Add Product";

    document
        .getElementById(
            "productModal"
        )
        .classList.add("show");

}


/* ================= EDIT PRODUCT ================= */

function requestEditProduct(id) {

    if (!adminLoggedIn) {

        showToast(
            "Admin login required."
        );

        return;
    }

    pendingAction = {
        type: "edit",
        id: id
    };

    openPasscodeModal();

}


/* ================= DELETE PRODUCT ================= */

function requestDeleteProduct(id) {

    if (!adminLoggedIn) {

        showToast(
            "Admin login required."
        );

        return;
    }

    const confirmed =
        confirm(
            "Are you sure you want to delete this product?"
        );

    if (!confirmed) {
        return;
    }

    pendingAction = {
        type: "delete",
        id: id
    };

    openPasscodeModal();

}


/* ================= CATEGORY MODAL ================= */

function openCategoryModal() {

    if (!adminLoggedIn) {

        showToast(
            "Admin login required."
        );

        return;
    }

    document
        .getElementById(
            "categoryModal"
        )
        .classList.add("show");

}


/* ================= PASSCODE ================= */

function openPasscodeModal() {

    document
        .getElementById(
            "passcodeModal"
        )
        .classList.add("show");

    document
        .getElementById(
            "adminPasscode"
        )
        .value = "";

}


async function confirmPasscode() {

    const passcode =
        document.getElementById(
            "adminPasscode"
        ).value;

    if (!passcode) {

        showToast(
            "Enter admin passcode."
        );

        return;
    }


    if (
        pendingAction &&
        pendingAction.type === "edit"
    ) {

        const product =
            products.find(
                p =>
                    String(p.ProductID) ===
                    String(pendingAction.id)
            );


        closeModals();

        fillProductForm(
            product
        );

        document
            .getElementById(
                "productModalTitle"
            )
            .textContent =
            "Edit Product";

        document
            .getElementById(
                "productModal"
            )
            .classList.add("show");


        window.editPasscode =
            passcode;


        pendingAction = null;

        return;

    }


    if (
        pendingAction &&
        pendingAction.type === "delete"
    ) {

        const id =
            pendingAction.id;

        closeModals();

        await performDelete(
            id,
            passcode
        );

        pendingAction = null;

    }

}


/* ================= SAVE PRODUCT ================= */

async function saveProduct() {

    const id =
        document.getElementById(
            "productID"
        ).value;

    const name =
        document.getElementById(
            "productName"
        ).value.trim();

    const category =
        document.getElementById(
            "productCategory"
        ).value;

    const price =
        document.getElementById(
            "productPrice"
        ).value;

    const stock =
        document.getElementById(
            "productStock"
        ).value;

    const description =
        document.getElementById(
            "productDescription"
        ).value.trim();

    const image =
        document.getElementById(
            "productImage"
        ).value.trim();


    if (!name || !category) {

        showToast(
            "Product name and category are required."
        );

        return;
    }


    let passcode =
        window.editPasscode;


    /* NEW PRODUCT */

    if (!id) {

        passcode =
            await askPasscode();

        if (!passcode) {
            return;
        }


        const result =
            await api(
                "addProduct",
                {
                    adminEmail:
                        "reyesjoesen6@gmail.com",

                    passcode,

                    name,
                    category,
                    price,
                    stock,
                    description,
                    image
                }
            );


        if (result.success) {

            closeModals();

            clearProductForm();

            showToast(
                "Product added successfully."
            );

            await loadProducts();

        } else {

            showToast(
                result.message
            );

        }

        return;
    }


    /* UPDATE PRODUCT */

    if (!passcode) {

        passcode =
            await askPasscode();

        if (!passcode) {
            return;
        }

    }


    const result =
        await api(
            "updateProduct",
            {
                adminEmail:
                    "reyesjoesen6@gmail.com",

                passcode,

                id,
                name,
                category,
                price,
                stock,
                description,
                image,
                status: "Available"
            }
        );


    if (result.success) {

        closeModals();

        window.editPasscode =
            null;

        showToast(
            "Product updated successfully."
        );

        await loadProducts();

    } else {

        showToast(
            result.message
        );

    }

}


/* ================= DELETE ================= */

async function performDelete(
    id,
    passcode
) {

    const result =
        await api(
            "deleteProduct",
            {
                adminEmail:
                    "reyesjoesen6@gmail.com",

                passcode,

                id
            }
        );


    if (result.success) {

        showToast(
            "Product deleted successfully."
        );

        await loadProducts();

    } else {

        showToast(
            result.message
        );

    }

}


/* ================= ADD CATEGORY ================= */

async function saveCategory() {

    const name =
        document.getElementById(
            "newCategory"
        ).value.trim();

    if (!name) {

        showToast(
            "Enter a category name."
        );

        return;
    }


    const passcode =
        await askPasscode();

    if (!passcode) {
        return;
    }


    const result =
        await api(
            "addCategory",
            {
                adminEmail:
                    "reyesjoesen6@gmail.com",

                passcode,

                name
            }
        );


    if (result.success) {

        closeModals();

        document
            .getElementById(
                "newCategory"
            )
            .value = "";

        showToast(
            "Category added successfully."
        );

        await loadCategories();

    } else {

        showToast(
            result.message
        );

    }

}


/* ================= ASK PASSCODE ================= */

function askPasscode() {

    return new Promise(
        resolve => {

            const passcode =
                prompt(
                    "Enter Admin Passcode:"
                );

            resolve(
                passcode
            );

        }
    );

}


/* ================= FILL FORM ================= */

function fillProductForm(product) {

    if (!product) {
        return;
    }

    document
        .getElementById(
            "productID"
        )
        .value =
        product.ProductID;

    document
        .getElementById(
            "productName"
        )
        .value =
        product.Name;

    document
        .getElementById(
            "productCategory"
        )
        .value =
        product.Category;

    document
        .getElementById(
            "productPrice"
        )
        .value =
        product.Price;

    document
        .getElementById(
            "productStock"
        )
        .value =
        product.Stock;

    document
        .getElementById(
            "productDescription"
        )
        .value =
        product.Description || "";

    document
        .getElementById(
            "productImage"
        )
        .value =
        product.Image || "";

}


/* ================= CLEAR FORM ================= */

function clearProductForm() {

    document
        .getElementById(
            "productID"
        )
        .value = "";

    document
        .getElementById(
            "productName"
        )
        .value = "";

    document
        .getElementById(
            "productPrice"
        )
        .value = "";

    document
        .getElementById(
            "productStock"
        )
        .value = "";

    document
        .getElementById(
            "productDescription"
        )
        .value = "";

    document
        .getElementById(
            "productImage"
        )
        .value = "";

}


/* ================= CLOSE MODALS ================= */

function closeModals() {

    document
        .querySelectorAll(".modal")
        .forEach(
            modal =>
                modal.classList.remove("show")
        );

}


/* ================= SHOW ADMIN LOGIN ================= */

function showAdminLoginStep() {

    document
        .getElementById(
            "adminLoginStep"
        )
        .classList.remove("hidden");

    document
        .getElementById(
            "adminOTPStep"
        )
        .classList.add("hidden");

}


/* ================= CUSTOMER LOGIN ================= */

function showCustomerLoginStep() {

    document
        .getElementById(
            "customerLoginStep"
        )
        .classList.remove("hidden");

}


/* ================= TOAST ================= */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );

}


/* ================= FORMAT PRICE ================= */

function formatPrice(value) {

    return Number(value || 0)
        .toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 2
            }
        );

}


/* ================= HTML SECURITY ================= */

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}              populateCategoryFilters(
                    "customerCategory",
                    data.categories
                );


                renderCustomerProducts();

            }
        )

        .withFailureHandler(
            handleError
        )

        .getCustomerDashboard(
            sessionToken
        );

}


/* =========================================
   CATEGORY FILTERS
========================================= */

function populateCategoryFilters(
    elementId,
    categories
) {

    const select =
        $(elementId);


    select.innerHTML =
        '<option value="">All Categories</option>';


    categories.forEach(
        function (category) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category.name;

            option.textContent =
                category.name;

            select.appendChild(
                option
            );

        }
    );

}


function populateProductCategory(
    categories
) {

    const select =
        $("productCategory");


    select.innerHTML = "";


    categories.forEach(
        function (category) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category.name;

            option.textContent =
                category.name;

            select.appendChild(
                option
            );

        }
    );

}


/* =========================================
   PRODUCT ICON
========================================= */

function getProductIcon(category) {

    const value =
        String(category)
            .toLowerCase();


    if (value.includes("gaming")) {
        return "🎮";
    }


    if (value.includes("monitor")) {
        return "🖥️";
    }


    if (value.includes("storage")) {
        return "💾";
    }


    if (value.includes("network")) {
        return "📡";
    }


    if (value.includes("computer")) {
        return "💻";
    }


    return "⌨️";
}


/* =========================================
   ADMIN PRODUCTS
========================================= */

function renderAdminProducts() {

    const container =
        $("adminProducts");


    const search =
        $("adminSearch")
            .value
            .toLowerCase()
            .trim();


    const category =
        $("adminCategory")
            .value;


    const products =
        adminData.products.filter(
            function (product) {

                const name =
                    product.name
                        .toLowerCase();


                const matchSearch =
                    name.includes(search);


                const matchCategory =
                    !category ||
                    product.category === category;


                return (
                    matchSearch &&
                    matchCategory
                );

            }
        );


    container.innerHTML = "";


    if (products.length === 0) {

        container.innerHTML = `
            <p style="
                grid-column:1/-1;
                text-align:center;
                padding:40px;
                color:#6b7280;
            ">
                No products found.
            </p>
        `;

        return;
    }


    products.forEach(
        function (product) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "product-card";


            card.innerHTML = `

                <div class="product-icon">
                    ${getProductIcon(
                        product.category
                    )}
                </div>

                <h3>
                    ${escapeHTML(
                        product.name
                    )}
                </h3>

                <span class="category">
                    ${escapeHTML(
                        product.category
                    )}
                </span>

                <div class="price">
                    ₱${Number(
                        product.price
                    ).toLocaleString()}
                </div>

                <div class="stock">
                    Stock: ${product.stock}
                </div>

                <p class="product-description">
                    ${escapeHTML(
                        product.description
                    )}
                </p>

                <div class="product-actions">

                    <button
                        class="edit-btn"
                        onclick="requestEdit(
                            '${product.id}'
                        )">

                        Edit

                    </button>

                    <button
                        class="delete-btn"
                        onclick="requestDelete(
                            '${product.id}'
                        )">

                        Delete

                    </button>

                </div>
            `;


            container.appendChild(card);

        }
    );

}


/* =========================================
   CUSTOMER PRODUCTS
========================================= */

function renderCustomerProducts() {

    const container =
        $("customerProducts");


    const search =
        $("customerSearch")
            .value
            .toLowerCase()
            .trim();


    const category =
        $("customerCategory")
            .value;


    const products =
        customerData.products.filter(
            function (product) {

                const matchSearch =
                    product.name
                        .toLowerCase()
                        .includes(search);


                const matchCategory =
                    !category ||
                    product.category === category;


                return (
                    matchSearch &&
                    matchCategory
                );

            }
        );


    container.innerHTML = "";


    if (products.length === 0) {

        container.innerHTML = `
            <p style="
                grid-column:1/-1;
                text-align:center;
                padding:40px;
                color:#6b7280;
            ">
                No products found.
            </p>
        `;

        return;
    }


    products.forEach(
        function (product) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "product-card";


            card.innerHTML = `

                <div class="product-icon">
                    ${getProductIcon(
                        product.category
                    )}
                </div>

                <h3>
                    ${escapeHTML(
                        product.name
                    )}
                </h3>

                <span class="category">
                    ${escapeHTML(
                        product.category
                    )}
                </span>

                <div class="price">
                    ₱${Number(
                        product.price
                    ).toLocaleString()}
                </div>

                <div class="stock">
                    Stock: ${product.stock}
                </div>

                <p class="product-description">
                    ${escapeHTML(
                        product.description
                    )}
                </p>

            `;


            container.appendChild(card);

        }
    );

}


/* =========================================
   ADD PRODUCT
========================================= */

function openAddProduct() {

    $("productModalTitle")
        .textContent =
        "Add Product";


    $("productId").value = "";

    $("productName").value = "";

    $("productPrice").value = "";

    $("productStock").value = "";

    $("productDescription").value = "";

    $("productStatus").value =
        "Available";


    show("productModal");
}


/* =========================================
   EDIT PRODUCT REQUEST
========================================= */

function requestEdit(id) {

    pendingAction = {
        type: "edit",
        id: id
    };


    openPasscodeModal();
}


/* =========================================
   EDIT PRODUCT
========================================= */

function editProduct(id) {

    const product =
        adminData.products.find(
            function (item) {
                return item.id === id;
            }
        );


    if (!product) {
        return;
    }


    $("productModalTitle")
        .textContent =
        "Edit Product";


    $("productId").value =
        product.id;


    $("productName").value =
        product.name;


    $("productCategory").value =
        product.category;


    $("productPrice").value =
        product.price;


    $("productStock").value =
        product.stock;


    $("productDescription").value =
        product.description;


    $("productStatus").value =
        product.status;


    show("productModal");
}


/* =========================================
   DELETE PRODUCT
========================================= */

function requestDelete(id) {

    pendingAction = {
        type: "delete",
        id: id
    };


    openPasscodeModal();
}


/* =========================================
   PASSCODE MODAL
========================================= */

function openPasscodeModal() {

    $("adminPasscode").value = "";

    show("passcodeModal");

}


function closePasscodeModal() {

    hide("passcodeModal");

    pendingAction = null;

}


/* =========================================
   VERIFY ADMIN PASSCODE
========================================= */

function confirmPasscode() {

    const passcode =
        $("adminPasscode")
            .value;


    if (!passcode) {

        alert(
            "Please enter the admin passcode."
        );

        return;
    }


    google.script.run

        .withSuccessHandler(
            function () {

                const action =
                    pendingAction;


                closePasscodeModal();


                if (!action) {
                    return;
                }


                /* EDIT */

                if (
                    action.type ===
                    "edit"
                ) {

                    editProduct(
                        action.id
                    );

                    return;
                }


                /* DELETE PRODUCT */

                if (
                    action.type ===
                    "delete"
                ) {

                    if (
                        !confirm(
                            "Delete this product?"
                        )
                    ) {
                        return;
                    }


                    google.script.run

                        .withSuccessHandler(
                            function () {

                                loadAdminDashboard();

                            }
                        )

                        .withFailureHandler(
                            handleError
                        )

                        .deleteProduct(
                            sessionToken,
                            action.id
                        );

                    return;
                }


                /* DELETE CATEGORY */

                if (
                    action.type ===
                    "deleteCategory"
                ) {

                    if (
                        !confirm(
                            "Delete this category?"
                        )
                    ) {
                        return;
                    }


                    google.script.run

                        .withSuccessHandler(
                            function () {

                                loadAdminDashboard();

                            }
                        )

                        .withFailureHandler(
                            handleError
                        )

                        .deleteCategory(
                            sessionToken,
                            action.id
                        );

                }

            }
        )

        .withFailureHandler(
            handleError
        )

        .verifyAdminPasscode(
            sessionToken,
            passcode
        );

}


/* =========================================
   SAVE PRODUCT
========================================= */

function saveProduct() {

    const product = {

        id:
            $("productId").value,

        name:
            $("productName")
                .value
                .trim(),

        category:
            $("productCategory")
                .value,

        price:
            Number(
                $("productPrice").value
            ),

        stock:
            Number(
                $("productStock").value
            ),

        description:
            $("productDescription")
                .value
                .trim(),

        status:
            $("productStatus")
                .value

    };


    if (!product.name) {

        alert(
            "Product name is required."
        );

        return;
    }


    const isEdit =
        Boolean(product.id);


    if (isEdit) {

        google.script.run

            .withSuccessHandler(
                function () {

                    closeProductModal();

                    loadAdminDashboard();

                }
            )

            .withFailureHandler(
                handleError
            )

            .updateProduct(
                sessionToken,
                product
            );


    } else {

        google.script.run

            .withSuccessHandler(
                function () {

                    closeProductModal();

                    loadAdminDashboard();

                }
            )

            .withFailureHandler(
                handleError
            )

            .addProduct(
                sessionToken,
                product
            );

    }

}


/* =========================================
   CATEGORY MODAL
========================================= */

function openCategoryModal() {

    $("newCategory").value = "";

    show("categoryModal");

}


function closeCategoryModal() {

    hide("categoryModal");

}


/* =========================================
   SAVE CATEGORY
========================================= */

function saveCategory() {

    const name =
        $("newCategory")
            .value
            .trim();


    if (!name) {

        alert(
            "Category name is required."
        );

        return;
    }


    google.script.run

        .withSuccessHandler(
            function () {

                closeCategoryModal();

                loadAdminDashboard();

            }
        )

        .withFailureHandler(
            handleError
        )

        .addCategory(
            sessionToken,
            name
        );

}


/* =========================================
   CATEGORY TABLE
========================================= */

function renderCategories() {

    const tbody =
        $("categoryTable");


    tbody.innerHTML = "";


    adminData.categories.forEach(
        function (category) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        category.id
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        category.name
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        category.status
                    )}
                </td>

                <td>

                    <button
                        class="delete-btn"
                        onclick="requestDeleteCategory(
                            '${category.id}'
                        )">

                        Delete

                    </button>

                </td>

            `;


            tbody.appendChild(row);

        }
    );

}


/* =========================================
   DELETE CATEGORY
========================================= */

function requestDeleteCategory(id) {

    pendingAction = {

        type:
            "deleteCategory",

        id:
            id

    };


    openPasscodeModal();

}


/* =========================================
   CLOSE PRODUCT MODAL
========================================= */

function closeProductModal() {

    hide("productModal");

}


/* =========================================
   LOGOUT
========================================= */

function logout() {

    if (
        typeof google !==
        "undefined"
    ) {

        google.script.run
            .logout(sessionToken);

    }


    sessionToken = "";

    currentRole = "";

    currentEmail = "";


    location.reload();

}


/* =========================================
   ERROR HANDLER
========================================= */

function handleError(error) {

    const message =
        error &&
        error.message
            ? error.message
            : "Something went wrong.";


    alert(message);

}
