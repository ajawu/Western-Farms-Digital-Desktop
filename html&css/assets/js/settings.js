const Database = require('better-sqlite3');
const swal = require('sweetalert');
const numeral = require('numeral');
const bcrypt = require('bcryptjs');
const { getCurrentWindow } = require('electron').remote;

// Personal Info
const firstNameField = document.getElementById('first-name');
const lastNameField = document.getElementById('last-name');
const emailField = document.getElementById('email');
const phoneField = document.getElementById('phone');

// Password
const oldPasswordField = document.getElementById('old-password');
const passwordOneField = document.getElementById('password1');
const passwordTwoField = document.getElementById('password2');

// Company Info
const companyNameField = document.getElementById('company-name');
const companyMottoField = document.getElementById('company-motto');
const companyAddressField = document.getElementById('address');

const updatePersonalInfoButton = document.getElementById('personal-button');
const updatePasswordButton = document.getElementById('password-button');
const updateCompanyInfoButton = document.getElementById('company-button');

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

/**
 * Retrieve user information stored in local storage for authentication
 * @returns {object}
 */
function retrieveUserInfo() {
  // { email: emailAddress, id: userId, name: `${firstName} ${lastName}` }));
  return JSON.parse(window.localStorage.getItem('auth'));
}

updatePersonalInfoButton.addEventListener('click', () => {
  if (validateInputField([firstNameField, lastNameField, emailField, phoneField])) {
    const userId = retrieveUserInfo().id;
    const db = new Database('html&css/assets/js/western-data.db', { verbose: console.log });

    try {
      const userQuery = db.prepare(`UPDATE auth SET first_name = @first_name, last_name = @last_name,
            email = @email WHERE id = @id`);
      userQuery.run({
        first_name: firstNameField.value,
        last_name: lastNameField.value,
        email: emailField.value,
        id: userId,
      });
      swal("Success", 'Personal info updated', "success")
        .then(() => {
          // getCurrentWindow().reload();
        });
    } catch (err) {
      swal("Oops!", err.message, "error");
    }
    db.close();
  }
});

updatePasswordButton.addEventListener('click', () => {
  if (validateInputField([firstNameField, lastNameField, emailField, phoneField])) {
    const userId = retrieveUserInfo().id;
    let db = new Database('html&css/assets/js/western-data.db', { verbose: console.log });

    try {
      const passwordRow = db.prepare('SELECT password FROM auth WHERE id = ?').get(userId);
      if (passwordRow) {
        bcrypt.compare(oldPasswordField.value, passwordRow.password, (err, res) => {
          if (res) {
            console.log('Compared success');
            if (passwordOneField.value === passwordTwoField.value) {
              console.log('password match');
              bcrypt.hash(passwordOneField.value, 8, (hashError, hash) => {
                console.log('hash generated');
                if (hash) {
                  db = new Database('html&css/assets/js/western-data.db', { verbose: console.log });
                  db.prepare(`UPDATE auth SET password = ? WHERE id = ?`).run(hash, userId);
                  swal("Success", 'Personal info updated', "success");
                } else {
                  swal("Oops!", hashError, "error");
                }
              });
            } else {
              swal("Oops!", 'Password must be the same in password one and two fields', "error");
            }
          } else {
            swal("Oops!", 'Invalid Password entered', "error");
          }
        });
      } else {
        console.log('Error occurred while fetching password');
      }
    } catch (err) {
      swal("Oops!", err.message, "error");
    }
    db.close();
  }
});

updateCompanyInfoButton.addEventListener('click', () => {
  if (validateInputField([companyNameField, companyMottoField, companyAddressField])) {
    const db = new Database('html&css/assets/js/western-data.db', { verbose: console.log });

    try {
      const userQuery = db.prepare(`UPDATE company SET company_name = ?, company_motto = ?, company_address = ? WHERE id = 1`);
      userQuery.run(companyNameField.value, companyMottoField.value, companyAddressField.value);
      swal("Success", 'Company info updated', "success")
        .then(() => {
          // getCurrentWindow().reload();
        });
    } catch (err) {
      swal("Oops!", err.message, "error");
    }
    db.close();
  }
});

window.onload = () => {
  const userId = retrieveUserInfo().id;
  const db = new Database('html&css/assets/js/western-data.db', { verbose: console.log });

  try {
    const userQuery = db.prepare(`SELECT id, first_name, last_name, email, date_joined, phone,
      total_sales, is_admin, date_joined FROM auth WHERE id = ?`);
    const userRow = userQuery.get(userId);
    if (userRow) {
      firstNameField.value = userRow.first_name;
      lastNameField.value = userRow.last_name;
      emailField.value = userRow.email;
      phoneField.value = userRow.phone;

      document.getElementById('nameText').textContent = `${userRow.first_name} ${userRow.last_name}`;
      document.getElementById('userIdText').textContent = numeral(userId).format('000000');
      document.getElementById('adminText').textContent = userRow.is_admin ? 'Administrator' : 'Sales Personnel';
      document.getElementById('dateJoinedText').textContent = userRow.date_joined;
      document.getElementById('totalSalesText').textContent = userRow.total_sales;
    }
  } catch (err) {
    swal("Oops!", err.message, "error");
  }

  try {
    const companyRow = db.prepare(`SELECT * FROM company`).get();
    if (companyRow) {
      companyNameField.value = companyRow.company_name;
      companyMottoField.value = companyRow.company_motto;
      companyAddressField.value = companyRow.company_address;
    }
  } catch (err) {
    swal("Oops!", err.message, "error");
  }
  db.close();
};
