const Database = require('better-sqlite3');
const $ = require('jquery');
const numeral = require('numeral');
const Datatable = require('datatables.net-bs5')();
const PHE = require('print-html-element');
const swal = require('sweetalert');
const bootstrap = require('bootstrap');
const { app, getCurrentWindow } = require('electron').remote;
const path = require('path');

const databasePath = path.join(
    app.getAppPath('userData').replace('app.asar', ''),
    'western-data.db',
);
const salesTableBody = $('#inventory-body');
const salesDetailsBody = $('#salesDetailsBody');

/**
 * Append Sales details to inventory table
 */
function displayRow(
    salesId,
    customerName,
    totalRevenue,
    totalPrice,
    purchaseTime,
    paymentMethod,
) {
    const tableRow = `<tr>
      <td><span class="fw-bold">${numeral(salesId).format('000000')}</span></td>
      <td><span class="fw-normal text-capitalize">${customerName}</span></td>
      <td><span class="fw-bold text-success">₦${numeral(totalRevenue).format(
          '0,0.0',
      )}</span></td>
      <td><span class="fw-normal">₦${numeral(totalPrice).format(
          '0,0.0',
      )}</span></td>
      <td><span class="fw-bold">${purchaseTime.split(' ')[0]}</span></td>
      ${
          paymentMethod === 'Cash'
              ? `<td><span class="fw-bold text-success">${paymentMethod}</span></td>`
              : `<td><span class="fw-bold text-secondary">${paymentMethod}</span></td>`
      }
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
              <button class="dropdown-item d-flex align-items-center" onclick="getSale(${salesId})">
                  <svg class="dropdown-icon text-gray-400 me-2" fill="currentColor"
                      viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                      <path fill-rule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clip-rule="evenodd"></path>
                  </svg> View Details
              </button>
              <button class="dropdown-item d-flex align-items-center d-none admin-only-button" onclick="processRefund(${salesId}, '${customerName}')">
                  <svg class="dropdown-icon text-gray-400 me-2" fill="currentColor" viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd"
                      d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z"
                      clip-rule="evenodd"></path>
                  </svg>
                  Refund
              </button>
          </div>
        </div>
        <button class="btn btn-link text-dark m-0 p-0 d-none admin-only-button" onclick="addDelete(${salesId}, '${customerName}')" data-bs-toggle="modal" data-bs-target="#deleteModal">
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
    salesTableBody.append(tableRow);
}

/**
 * Display the sales items retrieved from the database
 */
function displaySalesData(
    productName,
    unitCost,
    quantity,
    totalCost,
    indexNumber,
) {
    const row = `
    <tr>
      <td class="text-center"><span href="#" class="text-primary fw-bold">${indexNumber}</span> </td>
      <td class="fw-bold text-center text-capitalize">
        ${productName}
      </td>
      <td class="text-center">
        ₦${numeral(unitCost).format('0,0.0')}
      </td>
      <td class="text-center">
        ${quantity}
      </td>
      <td class="text-center">
        ₦${numeral(totalCost).format('0,0.0')}
      </td>
    </tr>`;
    salesDetailsBody.append(row);
}

/**
 * get the first and last name of the user with matching user id
 */
function getSalesRepName(userId) {
    const db = new Database(databasePath, { verbose: console.log });
    try {
        const salesRepQuery = db.prepare(
            'SELECT first_name, last_name FROM auth WHERE id = ?',
        );
        const salesRep = salesRepQuery.get(userId);
        return `${salesRep.first_name} ${salesRep.last_name}`;
    } catch (err) {
        swal('Oops', err.message, 'error');
    }
    db.close();
    return undefined;
}

/**
 * Get all sales items with matching sale id and render it on the page
 */
function getSalesItems(saleId) {
    const db = new Database(databasePath, { verbose: console.log });
    try {
        const salesRepQuery = db.prepare(
            'SELECT product_name, unit_cost, quantity, total_cost FROM sales_item WHERE sale = ?',
        );
        let index = 1;
        salesDetailsBody.empty(); // Clear previous sales table content
        salesRepQuery.all(saleId).forEach((saleItem) => {
            displaySalesData(
                saleItem.product_name,
                saleItem.unit_cost,
                saleItem.quantity,
                saleItem.total_cost,
                index,
            );
            index += 1;
        });
    } catch (err) {
        swal('Oops', err.message, 'error');
    }
    db.close();
    return undefined;
}

/**
 * Get the sale with matching id
 */
function getSale(salesId) {
    const db = new Database(databasePath, { verbose: console.log });
    try {
        const selectProductQuery = db.prepare(
            'SELECT customer_name, date(purchase_time) as purchase_date, total_price, total_revenue, payment_method, sales_rep FROM sales WHERE id = ?',
        );
        const salesRow = selectProductQuery.get(`${salesId}`);
        console.log(salesRow);
        if (salesRow) {
            // Load data into form fields
            document.getElementById('customerName').textContent =
                salesRow.customer_name;
            document.getElementById('salesRepName').textContent =
                getSalesRepName(salesRow.sales_rep || 'Error'); // Get sales rep name
            document.getElementById('purchaseDate').textContent =
                salesRow.purchase_date;
            document.getElementById('paymentMethod').textContent =
                salesRow.payment_method;
            document.getElementById('totalCost').textContent = numeral(
                salesRow.total_price,
            ).format('0,0.0');
            document.getElementById('totalRevenue').textContent = numeral(
                salesRow.total_revenue,
            ).format('0,0.0');
            getSalesItems(`${salesId}`); // Render sales Items
            // Format popup modal
            const productModal = new bootstrap.Modal(
                document.getElementById('product-modal'),
            );
            productModal.show();
        } else {
            swal('Oops', 'An error occurred while fetching product', 'error');
        }
    } catch (err) {
        swal('Oops', err.message, 'error');
    }
    db.close();
}

/**
 * Populate the refund modal with details of the selected sale
 */
function processRefund(salesId, customerName) {
    document.getElementById('refundSalesId').textContent = salesId;
    document.getElementById(
        'refundSalesName',
    ).textContent = `With ID "${salesId}" for "${customerName}"`;
    const refundModal = new bootstrap.Modal(
        document.getElementById('refundModal'),
    );
    refundModal.show();
}

/**
 * Increase the quantity of product in database by addQuantity number
 * @param {number} addQuantity number to add to product quantity
 */
function updateProduct(addQuantity, productId) {
    const db = new Database(databasePath, { verbose: console.log });
    try {
        const productUpdateQuery = db.prepare(
            'UPDATE product SET quantity = quantity + ? WHERE id = ?',
        );
        productUpdateQuery.run(parseInt(addQuantity, 10), productId);
        db.close();
        return true;
    } catch (err) {
        swal('Oops!', err.message, 'error');
        db.close();
        return false;
    }
}

/**
 * Refunds the product by updating existing product quantity numbers
 */
function refundProduct() {
    const db = new Database(databasePath, { verbose: console.log });
    const salesId = document.getElementById('refundSalesId').textContent;
    try {
        const salesItemQuery = db.prepare(
            'SELECT quantity, product FROM sales_item WHERE sale = ?',
        );
        salesItemQuery.all(salesId).forEach((row) => {
            updateProduct(row.quantity, row.product);
        });
    } catch (err) {
        swal('Oops!', err.message, 'error');
    }

    try {
        const deleteSalesQuery = db.prepare('DELETE FROM sales WHERE id = ?');
        swal('Success', 'Selected sale refunded', 'success').then(() => {
            getCurrentWindow().reload();
        });
        deleteSalesQuery.run(salesId);
    } catch (err) {
        swal('Oops!', 'An Error occurred while deleting items', 'error');
    }

    db.close();
}

/**
 * Add details of product to be deleted to the delete modal
 * @param {number} salesId id of the sale to be deleted
 * @param {string} productName name of the product to be deleted
 */
// eslint-disable-next-line no-unused-vars
function addDelete(salesId, productName) {
    document.getElementById(
        'salesDeleteName',
    ).textContent = `By "${productName}" with ID "${numeral(salesId).format(
        '000000',
    )}"`;
    document.getElementById('salesIdField').textContent = salesId;
}

/**
 * Delete the product with matching product id fron the db
 */
// eslint-disable-next-line no-unused-vars
function deleteProduct() {
    const db = new Database(databasePath, { verbose: console.log });
    const salesId = document.getElementById('salesIdField').textContent;
    try {
        const deleteProductQuery = db.prepare('DELETE FROM sales WHERE id = ?');
        deleteProductQuery.run(salesId);
        swal('Success', 'Product deleted successfully!', 'success').then(() => {
            getCurrentWindow().reload();
        });
    } catch (err) {
        swal('Oops!', err.message, 'error');
    }
    db.close();
}

/**
 * Load products from database
 */
function loadSales() {
    const db = new Database(databasePath, { verbose: console.log });
    try {
        const salesQuery = db.prepare(
            'SELECT id, customer_name, total_revenue, total_price, purchase_time, payment_method FROM sales',
        );
        salesQuery.all().forEach((sale) => {
            displayRow(
                sale.id,
                sale.customer_name,
                sale.total_revenue,
                sale.total_price,
                sale.purchase_time,
                sale.payment_method,
            );
        });

        $('#sales-table').DataTable();
        document.getElementById('tableLoad').classList.add('d-none');
        document.getElementById('sales-table').classList.remove('d-none');
    } catch (err) {
        swal('Oops!', err.message, 'error').then(() => {
            console.log('contact ajawudavid@gmail.com');
        });
    }
    db.close();
}

$(document).ready(() => {
    loadSales(false);
    // Display Name
    try {
        document.getElementById('full-name').textContent = JSON.parse(
            window.localStorage.getItem('auth'),
        ).name;
    } catch (err) {
        console.log('Element missing');
    }

    // Display admin only elements
    const isAdmin = JSON.parse(window.localStorage.getItem('auth')).admin;
    const adminElments = document.getElementsByClassName('admin-only-button');
    if (parseInt(isAdmin, 10) === 1) {
        for (const adminElement of adminElments) {
            adminElement.classList.remove('d-none');
        }
    }
});

document
    .getElementById('generate-report-button')
    .addEventListener('click', () => {
        PHE.printElement(document.getElementById('sales-table'));
    });
