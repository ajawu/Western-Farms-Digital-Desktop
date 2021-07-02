const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');
const Chartist = require('chartist');
const numeral = require('numeral');

const currentMonthTextFields = document.getElementsByClassName('current-month-text');
const customerCountField = document.getElementById('customer-count');
const salesTotalField = document.getElementById('salesTotal');
const revenueTotalField = document.getElementById('revenueTotal');
const periodDropdownText = document.getElementById('periodDropdownText');
const salesGraphText = document.getElementById('sales-graph-text');

/**
 * Display the pulled data from the database
 * @param {number} revenueTotal total revenue for selected period
 * @param {number} salesTotal total sales valueforselected period
 * @param {number} customerCount total customer count for sales period
 */
function displayData(revenueTotal, salesTotal, customerCount) {
  revenueTotalField.textContent = numeral(revenueTotal).format('0,0');
  salesTotalField.textContent = numeral(salesTotal).format('0,0');
  customerCountField.textContent = numeral(customerCount).format('0,0');
  salesGraphText.textContent = numeral(salesTotal).format('0,0');
}

/**
 * Format the time period displayed to the user
 * @param {string} displayedPeriod period of time sales were made
 */
function changePeriodText(displayedPeriod) {
  let periodText;

  if (displayedPeriod === 'all') {
    periodText = 'From first sale';
    periodDropdownText.textContent = 'All Time';
    // --
  } else if (displayedPeriod === 'today') {
    periodText = `${moment().format('ll')}`;
    periodDropdownText.textContent = 'Today';
    // --
  } else if (displayedPeriod === 'current-week') {
    periodText = `${moment().startOf('week').format('ll')} - ${moment().format('ll')}`;
    periodDropdownText.textContent = 'This Week';
    // --
  } else if (displayedPeriod === 'current-month') {
    periodText = `${moment().startOf('month').format('ll')} - ${moment().format('ll')}`;
    periodDropdownText.textContent = 'This Month';
    // --
  } else if (displayedPeriod === 'current-year') {
    periodText = `${moment().startOf('year').format('ll')} - ${moment().format('ll')}`;
    periodDropdownText.textContent = 'This Year';
    // --
  } else if (displayedPeriod === 'past-week') {
    periodText = `${moment().startOf('week').subtract(1, "week").format('ll')}
    - ${moment().startOf('week').subtract(1, "day").format('ll')}`;
    periodDropdownText.textContent = 'Last Week';
    // --
  } else if (displayedPeriod === 'past-month') {
    periodText = `${moment().startOf('month').subtract(1, "month").format('ll')}
    - ${moment().startOf('month').subtract(1, "day").format('ll')}`;
    periodDropdownText.textContent = 'Last Month';
    // --
  } else if (displayedPeriod === 'past-year') {
    periodText = `${moment().startOf('year').subtract(1, "year").format('ll')}
    - ${moment().startOf('year').subtract(1, "day").format('ll')}`;
    periodDropdownText.textContent = 'Last Year';
    // --
  } else {
    periodText = displayedPeriod;
  }

  Array.from(currentMonthTextFields).forEach((element) => { element.textContent = periodText; });
}

/**
 * Fetch sales within a given period
 * @param {string} period period of time to fetch sales
 */
function getSalesPeriod(period) {
  const db = new sqlite3.Database('html&css/assets/js/western-data.db');
  let statement;
  const date = new Date();
  let month = date.getMonth() + 1;
  if (month < 10) { month = `0${month}`; }

  if (period === 'all') {
    statement = db.prepare(`SELECT SUM(total_revenue) as total_revenue, SUM(total_price)
     as total_sales, COUNT(DISTINCT customer_name) as customer_count FROM sales`);
    // --
  } else if (period === 'today') {
    statement = db.prepare("SELECT SUM(total_revenue) as total_revenue, SUM(total_price) as total_sales, "
      + "COUNT(DISTINCT customer_name) as customer_count FROM sales WHERE strftime('%Y-%m-%d', `purchase_time`)='"
      + moment().format('YYYY[-]MM[-]DD') + "'");
    // --
  } else if (period === 'current-week') {
    statement = db.prepare("SELECT SUM(total_revenue) as total_revenue, SUM(total_price) as total_sales, "
      + "COUNT(DISTINCT customer_name) as customer_count FROM sales WHERE strftime('%Y-%m-%d', `purchase_time`)>='"
      + moment().startOf('week').format('YYYY[-]MM[-]DD') + "' AND strftime('%Y-%m-%d', `purchase_time`)<='" + moment().format('YYYY[-]MM[-]DD') + "'");
    // --
  } else if (period === 'current-month') {
    statement = db.prepare("SELECT SUM(total_revenue) as total_revenue, SUM(total_price) as total_sales, "
      + "COUNT(DISTINCT customer_name) as customer_count FROM sales WHERE strftime('%Y-%m-%d', `purchase_time`)>='"
      + moment().startOf('month').format('YYYY[-]MM[-]DD') + "' AND strftime('%Y-%m-%d', `purchase_time`)<='" + moment().format('YYYY[-]MM[-]DD') + "'");
    // --
  } else if (period === 'current-year') {
    statement = db.prepare("SELECT SUM(total_revenue) as total_revenue, SUM(total_price) as total_sales, "
      + "COUNT(DISTINCT customer_name) as customer_count FROM sales WHERE strftime('%Y-%m-%d', `purchase_time`)>='"
      + moment().startOf('year').format('YYYY[-]MM[-]DD') + "' AND strftime('%Y-%m-%d', `purchase_time`)<='" + moment().format('YYYY[-]MM[-]DD') + "'");
    // --
  } else if (period === 'past-week') {
    statement = db.prepare("SELECT SUM(total_revenue) as total_revenue, SUM(total_price) as total_sales, "
      + "COUNT(DISTINCT customer_name) as customer_count FROM sales WHERE strftime('%Y-%m-%d', `purchase_time`)>='"
      + moment().subtract(1, "week").startOf("week").format('YYYY[-]MM[-]DD') + "' AND strftime('%Y-%m-%d', `purchase_time`)<='"
      + moment().subtract(1, "week").endOf("week").format('YYYY[-]MM[-]DD') + "'");
    // --
  } else if (period === 'past-month') {
    statement = db.prepare("SELECT SUM(total_revenue) as total_revenue, SUM(total_price) as total_sales, "
      + "COUNT(DISTINCT customer_name) as customer_count FROM sales WHERE strftime('%Y-%m-%d', `purchase_time`)>='"
      + moment().subtract(1, "month").startOf("month").format('YYYY[-]MM[-]DD') + "' AND strftime('%Y-%m-%d', `purchase_time`)<='"
      + moment().subtract(1, "month").endOf("month").format('YYYY[-]MM[-]DD') + "'");
    // --
  } else if (period === 'past-year') {
    statement = db.prepare("SELECT SUM(total_revenue) as total_revenue, SUM(total_price) as total_sales, "
      + "COUNT(DISTINCT customer_name) as customer_count FROM sales WHERE strftime('%Y-%m-%d', `purchase_time`)>='"
      + moment().subtract(1, "year").startOf("year").format('YYYY[-]MM[-]DD') + "' AND strftime('%Y-%m-%d', `purchase_time`)<='"
      + moment().subtract(1, "year").endOf("year").format('YYYY[-]MM[-]DD') + "'");
  }

  statement.get((err, row) => {
    if (row) {
      displayData(row.total_revenue, row.total_sales, row.customer_count);
      changePeriodText(period);
    } else {
      // Log error and report to developer show error notification
      console.log(err);
      displayData(0, 0, 0);
      changePeriodText('An error occured - [E04]');
    }
  });
}

/**
 * Display a chartist line graph on the dashboard page
 * @param {Array} labels Graph labels on X axis
 * @param {Array} series Graph data to be displayed
 */
function displayGraphData(labels, series) {
  const chart = new Chartist.Line('.ct-chart-sales-value', {
    labels: labels,
    series: [series],
  }, {
    low: 0,
    showArea: true,
    fullWidth: true,
    axisX: {
      // On the x-axis start means top and end means bottom
      position: 'end',
      showGrid: true,
    },
    axisY: {
      // On the y-axis start means left and end means right
      showGrid: false,
      showLabel: false,
      labelInterpolationFnc: (value) => '$' + (value / 1) + 'k',
    },
  });
}

/**
 * Get dtaa to display in graphs from db
 * @param {string} period Period to extract data for
 */
function getGraphData(period) {
  console.log(period);
  displayGraphData(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [0, 10, 30, 40, 80, 60, 100]);
}

window.onload = () => {
  getSalesPeriod('today');
  getGraphData('today');
};
