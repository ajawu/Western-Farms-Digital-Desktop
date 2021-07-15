# Western Inventory Management System

A desktop app to handle inventory management.
Application features include:-
- Dashboard (Admin only)
    - View sales, revenue and customers over a selected period
    - Graph displaying sales data for selected period
- User Authentication
    - Login
    - Password Reset
    - Password Change
- Inventory Management
    - Add a new product
    - View existing products
    - Update and delete existing products
    - Search for product by any existing parameter
    - Sort products
- Sales Management
    - View sales
    - Search for sale by any existing parameter
    - Add new sale and generate a receipt for printing
    - Delete sale or trigger refund (Admin only)
- User management (Admin only)
    - Add new user
    - Delete or suspend an existing user
- Settings
    - Modify Firstname, Lastname, email, phone number and Password

## Sample Pages
1. Login Page.
    ![Login](/sample_images/login-page.png)
2. Dashboard Page.
    ![Dashboard](/sample_images/dashboard-page.png)

## Installation

Use the package manager [yarn](https://yarnpkg.com/) to install Western Desktop.

```bash
yarn
```

## Usage

```bash
yarn start
```

## Create a compiled version
The included package.json file is set up to create a portable windows exe file.
```bash
yarn dist
```

## Acknowledgment
Design based on **Volt - Bootstrap 5 Dashboard Template** which can be found [here](https://themesberg.com/product/admin-dashboard/volt-bootstrap-5-dashboard)

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
