const Database = require('better-sqlite3');
const $ = require('jquery');
const numeral = require('numeral');
const Datatable = require('datatables.net-bs5')();
const swal = require('sweetalert');
const bootstrap = require('bootstrap');
const { getCurrentWindow } = require('electron').remote;

const usersTableBody = $('#users-body');
const productIdField = document.getElementById('productIdField');
const productPopupIdField = document.getElementById('productPopupId');

const userModalId = document.getElementById('user-id-field');
const method = document.getElementById('dbMethod');
const firstNameField = document.getElementById('first-name');
const lastNameField = document.getElementById('last-name');
const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
const isAdminField = document.getElementById('remember');

/**
 * Display users loaded from the database in main page table
 */
function displayRow(id, firstName, lastName, email, dateJoined, totalSales, isActive) {
  const userHighlight = ['bg-primary', 'bg-secondary', 'bg-purple'];
  const randomColor = userHighlight[Math.floor(Math.random() * userHighlight.length)];

  const tableRow = `
  <tr>
    <td>
      ${numeral(id).format('000000')}
    </td>
    <td><a href="#" class="d-flex align-items-center">
        <div
          class="avatar d-flex align-items-center justify-content-center fw-bold rounded ${randomColor} text-white me-3">
          <span>${firstName.substring(0, 1)}${lastName.substring(0, 1)}</span>
        </div>
        <div class="d-block"><span class="fw-bold">${firstName} ${lastName}</span>
          <div class="small text-gray">${email}</div>
        </div>
      </a></td>
    <td><span class="fw-normal">${dateJoined}</span></td>
    <td><span class="fw-normal d-flex align-items-center">${totalSales}</span>
    </td>
    <td><span class="fw-normal ${isActive ? 'text-success' : 'text-danger'}">${isActive ? 'Active' : 'Suspended'}</span></td>
    <td>
      <div class="btn-group"><button
          class="btn btn-link text-dark dropdown-toggle dropdown-toggle-split m-0 p-0" data-bs-toggle="dropdown"
          aria-haspopup="true" aria-expanded="false"><svg class="icon icon-xs" fill="currentColor"
            viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z">
            </path>
          </svg> <span class="visually-hidden">Toggle Dropdown</span></button>
        <div class="dropdown-menu dashboard-dropdown dropdown-menu-start mt-2 py-1">
          <button class="dropdown-item d-flex align-items-center" onclick="getUser(${id})">
            <svg class="dropdown-icon text-gray-400 me-2" fill="currentColor"
                viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                <path fill-rule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clip-rule="evenodd"></path>
            </svg>
            View Details
          </button>
          <button class="dropdown-item d-flex align-items-center">
            <svg
              class="dropdown-icon text-danger me-2" fill="currentColor" viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11 6a3 3 0 11-6 0 3 3 0 016 0zM14 17a6 6 0 00-12 0h12zM13 8a1 1 0 100 2h4a1 1 0 100-2h-4z">
              </path>
            </svg> Suspend
          </button>
        </div>
      </div><svg class="icon icon-xs text-danger ms-1" title="" data-bs-toggle="tooltip" fill="currentColor"
        viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" data-bs-original-title="Delete"
        aria-label="Delete">
        <path fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"></path>
      </svg>
    </td>
  </tr>
  `;
  usersTableBody.append(tableRow);
}

/**
 * Load users from database
 */
function loadUsers() {
  const db = new Database('html&css/assets/js/western-data.db', { verbose: console.log });
  try {
    const usersQuery = db.prepare(`SELECT id, first_name, last_name, email, date_joined,
      total_sales, is_active FROM auth WHERE is_deleted = 0`);
    usersQuery.all().forEach((user) => {
      displayRow(user.id, user.first_name, user.last_name, user.email,
        user.date_joined, user.total_sales, user.is_active);
    });

    $('#users-table').DataTable();
    document.getElementById('tableLoad').classList.add('d-none');
    document.getElementById('users-table').classList.remove('d-none');
  } catch (err) {
    swal("Oops!", err.message, "error")
      .then(() => {
        console.log('contact ajawudavid@gmail.com');
      });
  }
  db.close();
}

/**
 * Resets the content of all input fields in the user modal
 */
function clearUserModal() {
  userModalId.value = '';
  firstNameField.value = '';
  lastNameField.value = '';
  emailField.value = '';
  passwordField.value = '';
  isAdminField.checked = false;
  method.value = 'create';
  document.getElementById('add-user').textContent = 'Add User';
  document.getElementById('user-modal-title').textContent = 'New User';
}

/**
 * Get the user with matching id
 * @param {int} id
 */
function getUser(id) {
  const db = new Database('html&css/assets/js/western-data.db', { verbose: console.log });
  try {
    const selectUserQuery = db.prepare(`SELECT id, first_name, last_name, email, is_admin, 
    last_login, total_sales FROM auth WHERE id = ?`);
    const userRow = selectUserQuery.get(id);
    if (userRow) {
      // Load data into form fields
      userModalId.value = `${id}`;
      firstNameField.value = userRow.first_name;
      lastNameField.value = userRow.last_name;
      emailField.value = userRow.email;
      passwordField.value = 'dummy_password';
      isAdminField.checked = !!userRow.is_admin;
      console.log(userRow.last_login);
      document.getElementById('last-login').value = userRow.last_login.split(' ')[0];
      document.getElementById('total-sales').value = userRow.total_sales;

      // Format popup modal
      method.value = 'create';
      document.getElementById('add-user').textContent = 'Update User';
      document.getElementById('user-modal-title').textContent = 'User Details';
      const productModal = new bootstrap.Modal(document.getElementById('new-user-modal'));
      productModal.show();
    } else {
      swal("Oops", "User with matching id does not exist", "error");
    }
  } catch (err) {
    swal("Oops", err.message, "error");
  }
  db.close();
}

/**
 * Add details of product to be deleted to the delete modal
 * @param {number} productId id of the product to be deleted
 * @param {string} productName name of the product to be deleted
 */
// eslint-disable-next-line no-unused-vars
function addDelete(productId, productName) {
  document.getElementById('productDeleteName').textContent = productName;
  productIdField.textContent = productId;
}

/**
 * Delete the product with matching product id
 */
// eslint-disable-next-line no-unused-vars
function deleteProduct() {
  const db = new Database('html&css/assets/js/western-data.db', { verbose: console.log });
  const productId = document.getElementById('productIdField').textContent;
  try {
    const deleteProductQuery = db.prepare('DELETE FROM product WHERE id = ?');
    deleteProductQuery.run(productId);
    swal("Success", "Product deleted successfully!", "success")
      .then(() => {
        getCurrentWindow().reload();
      });
  } catch (err) {
    swal("Oops!", err.message, "error");
  }
  db.close();
}

/**
 * Validate the input for the fields in the product popup and display errors for invalid fields
 * @param {Array} inputFields Array containing input fields to be validated
 * @returns {bool} true if all field is not blank and false otherwise
 */
function validateInputField(inputFields) {
  for (let index = 0; index < inputFields.length; index += 1) {
    if (inputFields[index].value) {
      inputFields[index].classList.remove('is-invalid');
    } else {
      inputFields[index].classList.add('is-invalid');
      return false;
    }
  }
  return true;
}

document.getElementById('add-user').addEventListener('click', (() => {
  if (validateInputField([productNameField, expiryDateField, costPriceField,
    sellingPriceField, skuField, quantityField])) {
    // ------
    const db = new Database('html&css/assets/js/western-data.db', { verbose: console.log });

    if (method.value === 'update') {
      try {
        const updateProductQuery = db.prepare(`UPDATE product SET name = ?, expiry_date = ?, sku = ?, selling_price = ?,
          cost_price = ?, quantity = ? WHERE id = ?`);
        updateProductQuery.run(productNameField.value, expiryDateField.value, skuField.value,
          sellingPriceField.value, costPriceField.value, quantityField.value,
          productPopupIdField.value);
        swal("Success", "Product updated successfully!", "success")
          .then(() => {
            getCurrentWindow().reload();
          });
      } catch (err) {
        swal("Oops!", err.message, "error");
      }
    } else if (method.value === 'create') {
      try {
        const createProductQuery = db.prepare(`INSERT INTO product (name, sku, selling_price, cost_price, quantity,
          date_added, expiry_date, has_expired, is_deleted) VALUES(?, ?, ?, ?, ?, date('now'), ?, 0, 0)`);
        createProductQuery.run(productNameField.value, skuField.value, sellingPriceField.value,
          costPriceField.value, quantityField.value, expiryDateField.value);
        swal("Success", "Product created successfully!", "success")
          .then(() => {
            getCurrentWindow().reload();
          });
      } catch (err) {
        swal("Oops!", err.message, "error");
      }
    }
    db.close();
  }
}));

$(document).ready(() => {
  loadUsers(false);
});
