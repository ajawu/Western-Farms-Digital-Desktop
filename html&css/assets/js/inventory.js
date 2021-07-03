const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');
const $ = require('jquery');
const numeral = require('numeral');
const Datatable = require('datatables.net-bs5')();
const swal = require('sweetalert');
const { getCurrentWindow, globalShortcut } = require('electron').remote;

const db = new sqlite3.Database('html&css/assets/js/western-data.db');
const inventoryTableBody = $('#inventory-body');

/**
 * Display the data from the database in the table
 * @param {Array} tableRows Array containing rows data to be added to the table
 */
function displayRow(tableRows) {
  tableRows.forEach((row) => {
    const tableRow = `<tr>
      <td><span class="fw-bold">${numeral(row[0]).format('000000')}</span></td>
      <td><span class="fw-normal text-capitalize">${row[1]}</span></td>
      <td><span class="fw-normal">${row[2].split(' ')[0]}</span></td>
      <td><span class="fw-normal">${row[3].split(' ')[0]}</span></td>
      <td><span class="fw-bold">₦${numeral(row[4]).format('0,0')}</span></td>
      ${row[5] ? `<td><span class="fw-bold text-danger">Expired</span></td>`
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
              <button class="dropdown-item d-flex align-items-center" onclick="getProduct(${row[0]})">
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
        <button class="btn btn-link text-dark m-0 p-0" onclick="addDelete(${row[0]}, '${row[1]}')" data-bs-toggle="modal" data-bs-target="#deleteModal">
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
  });
  $('#inventory-table').DataTable();
}

/**
 * Get the product with matching id
 * @param {int} productId
 */
function getProduct(productId) {
  db.get('SELECT * FROM product WHERE id=?', [productId], (err, row) => {
    if (row) {
      console.log(row);
    } else {
      console.log(err);
    }
  });
}

/**
 * Add details of product to be deleted to the delete modal
 * @param {number} productId id of the product to be deleted
 * @param {string} productName name of the product to be deleted
 */
function addDelete(productId, productName) {
  document.getElementById('productDeleteName').textContent = productName;
  document.getElementById('productIdField').textContent = productId;
}

/**
 * Delete the product with matching product id
 */
function deleteProduct() {
  const productId = document.getElementById('productIdField').textContent;
  db.run('DELETE FROM product WHERE id = ?', [productId], (err) => {
    if (err) {
      swal("Oops!", "An error occurred while deleting the product", "error");
    } else {
      swal("Success", "Product deleted successfully!", "success");
      setTimeout(() => {
        getCurrentWindow().reload();
      }, 500);
    }
  });
}

/**
 * Load inventory items from database
 * @param {boolean} hasExpired
 */
function loadInventory(hasExpired) {
  let query;
  let countQuery;
  const products = [];
  let productCount;
  let countCheck;
  if (hasExpired) {
    query = "SELECT * FROM product WHERE date(expiry_date)<'" + moment().format('YYYY[-]MM[-]DD') + "'";
    countQuery = "SELECT COUNT(*) as product_count FROM product WHERE date(expiry_date)<'"
      + moment().format('YYYY[-]MM[-]DD') + "'";
  } else {
    query = "SELECT * FROM product WHERE date(expiry_date)>'" + moment().format('YYYY[-]MM[-]DD') + "'";
    countQuery = "SELECT COUNT(*) as product_count FROM product WHERE date(expiry_date)>'"
      + moment().format('YYYY[-]MM[-]DD') + "'";
  }

  db.get(countQuery, (err, row) => {
    if (row) {
      if (row.product_count) {
        productCount = row.product_count;
        countCheck = setInterval(() => {
          if (products.length === productCount) {
            displayRow(products);
            // $('#inventory-table').Datatable();
            clearInterval(countCheck);
          }
        }, 1000);
      }
    }
  });

  db.each(query, (err, row) => {
    if (row) {
      products.push([row.id, row.name, row.date_added, row.expiry_date,
      // eslint-disable-next-line indent
      row.selling_price, row.has_expired]);
    } else {
      // display error
    }
  });
}

$(document).ready(() => {
  loadInventory(false);
  $('#inventory-button').trigger("click");
});
