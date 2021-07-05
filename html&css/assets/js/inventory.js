const Database = require('better-sqlite3');
const $ = require('jquery');
const numeral = require('numeral');
const Datatable = require('datatables.net-bs5')();
const swal = require('sweetalert');
const bootstrap = require('bootstrap');
const { getCurrentWindow } = require('electron').remote;

const inventoryTableBody = $('#inventory-body');
const productIdField = document.getElementById('productIdField');
const productPopupIdField = document.getElementById('productPopupId');
const method = document.getElementById('dbMethod');
const productNameField = document.getElementById('productName');
const expiryDateField = document.getElementById('expiryDate');
const costPriceField = document.getElementById('costPrice');
const sellingPriceField = document.getElementById('sellingPrice');
const skuField = document.getElementById('sku');
const quantityField = document.getElementById('quantity');

/**
 * Append product details to inventory table
 */
function displayRow(productId, name, quantity, expiryDate, price, status) {
  const tableRow = `<tr>
      <td><span class="fw-bold">${numeral(productId).format('000000')}</span></td>
      <td><span class="fw-normal text-capitalize">${name}</span></td>
      <td><span class="fw-normal">${quantity}</span></td>
      <td><span class="fw-normal">${expiryDate.split(' ')[0]}</span></td>
      <td><span class="fw-bold">₦${numeral(price).format('0,0')}</span></td>
      ${status ? `<td><span class="fw-bold text-danger">Expired</span></td>`
      : `<td><span class="fw-bold text-success">Unexpired</span></td>`}
      <td>
        <div class="btn-group">
          <button class="btn btn-link text-dark dropdown-toggle dropdown-toggle-split m-0 p-0"
              data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <svg class="icon icon-xs" fill="currentColor" viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                      d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z">
                  </path>
              </svg><span class="visually-hidden">Toggle Dropdown</span></button>
          <div class="dropdown-menu dashboard-dropdown dropdown-menu-start mt-2 py-1">
              <button class="dropdown-item d-flex align-items-center" onclick="getProduct(${productId})">
                  <svg class="dropdown-icon text-gray-400 me-2" fill="currentColor"
                      viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                      <path fill-rule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clip-rule="evenodd"></path>
                  </svg> View Details
              </button>
          </div>
        </div>
        <button class="btn btn-link text-dark m-0 p-0" onclick="addDelete(${productId}, '${name}')" data-bs-toggle="modal" data-bs-target="#deleteModal">
          <svg class="icon icon-xs text-danger" title="" data-bs-toggle="tooltip"
            fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
            data-bs-original-title="Delete" aria-label="Delete">
            <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"></path>
          </svg>
        </button>
      </td>
    </tr>`;
  inventoryTableBody.append(tableRow);
}

/**
 * Get the product with matching id
 * @param {int} productId
 */
function getProduct(productId) {
  const db = new Database('html&css/assets/js/western-data.db', { verbose: console.log });
  try {
    const selectProductQuery = db.prepare('SELECT name, expiry_date, cost_price, selling_price, sku, quantity FROM product WHERE id = ?');
    const productRow = selectProductQuery.get(productId);
    if (productRow) {
      // Load data into form fields
      productPopupIdField.value = productId;
      productNameField.value = productRow.name;
      expiryDateField.value = productRow.expiry_date;
      costPriceField.value = productRow.cost_price;
      sellingPriceField.value = productRow.selling_price;
      skuField.value = productRow.sku;
      quantityField.value = productRow.quantity;
      // Format popup modal
      document.getElementById('addProductButton').textContent = 'Update Product';
      document.getElementById('modal-title').textContent = 'Product Update';
      method.value = 'update';
      const productModal = new bootstrap.Modal(document.getElementById('product-modal'));
      productModal.show();
    } else {
      swal("Oops", "An error occurred while fetching product", "error");
    }
  } catch (err) {
    swal("Oops", err.message, "error");
  }
  db.close();
}

/**
 * Resets the content of all input fields in the product popup
 */
function clearProductPopup() {
  productPopupIdField.value = '';
  method.value = '';
  productNameField.value = '';
  expiryDateField.value = '';
  costPriceField.value = '';
  sellingPriceField.value = '';
  skuField.value = '';
  quantityField.value = '';
  method.value = 'create';
  document.getElementById('addProductButton').textContent = 'Add Product';
  document.getElementById('modal-title').textContent = 'New Product';
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
 * Load products from database
 */
function loadInventory() {
  const db = new Database('html&css/assets/js/western-data.db', { verbose: console.log });
  try {
    const productsQuery = db.prepare('SELECT id, name, quantity, expiry_date, selling_price, has_expired FROM product');
    productsQuery.all().forEach((product) => {
      displayRow(product.id, product.name, product.quantity, product.expiry_date,
        product.selling_price, product.has_expired);
    });

    $('#inventory-table').DataTable();
    document.getElementById('tableLoad').classList.add('d-none');
    document.getElementById('inventory-table').classList.remove('d-none');
  } catch (err) {
    swal("Oops!", err.message, "error")
      .then(() => {
        console.log('contact ajawudavid@gmail.com');
      });
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

document.getElementById('addProductButton').addEventListener('click', (() => {
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
  loadInventory(false);
});
