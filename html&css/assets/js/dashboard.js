const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');
const Chartist = require('chartist');
const numeral = require('numeral');
const ChartistTooltip = require('chartist-plugin-tooltips-updated');

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
  let startDate;
  let endDate;
  let query;

  if (period === 'today') {
    startDate = moment().format('YYYY[-]MM[-]DD');
    endDate = moment().format('YYYY[-]MM[-]DD');
    // --
  } else if (period === 'current-week') {
    startDate = moment().startOf('week').format('YYYY[-]MM[-]DD');
    endDate = moment().format('YYYY[-]MM[-]DD');
    // --
  } else if (period === 'current-month') {
    startDate = moment().startOf('month').format('YYYY[-]MM[-]DD');
    endDate = moment().format('YYYY[-]MM[-]DD');
    // --
  } else if (period === 'current-year') {
    startDate = moment().startOf('year').format('YYYY[-]MM[-]DD');
    endDate = moment().format('YYYY[-]MM[-]DD');
    // --
  } else if (period === 'past-week') {
    startDate = moment().subtract(1, "week").startOf("week").format('YYYY[-]MM[-]DD');
    endDate = moment().subtract(1, "week").endOf("week").format('YYYY[-]MM[-]DD');
    // --
  } else if (period === 'past-month') {
    startDate = moment().subtract(1, "month").startOf("month").format('YYYY[-]MM[-]DD');
    endDate = moment().subtract(1, "month").endOf("month").format('YYYY[-]MM[-]DD');
    // --
  } else if (period === 'past-year') {
    startDate = moment().subtract(1, "year").startOf("year").format('YYYY[-]MM[-]DD');
    endDate = moment().subtract(1, "year").endOf("year").format('YYYY[-]MM[-]DD');
  }

  // Create and execute db query
  const db = new sqlite3.Database('html&css/assets/js/western-data.db');

  if (period === 'all') {
    query = db.prepare(`SELECT SUM(total_revenue) as total_revenue, SUM(total_price)
     as total_sales, COUNT(DISTINCT customer_name) as customer_count FROM sales`);
  } else {
    query = db.prepare("SELECT SUM(total_revenue) as total_revenue, SUM(total_price) as total_sales, "
      + "COUNT(DISTINCT customer_name) as customer_count FROM sales WHERE strftime('%Y-%m-%d', `purchase_time`)>='"
      + startDate + "' AND strftime('%Y-%m-%d', `purchase_time`)<='" + endDate + "'");
  }

  query.get((err, row) => {
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
    plugins: [
      ChartistTooltip(),
    ],
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
  let label;
  let data;

  if (period === 'today') {
    data = [];
    label = ['12 AM', '6 AM', '12 PM', '6 PM'];

    const midnightToMorning = "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().format('YYYY[-]MM[-]DD') + "'"
      + "AND STRFTIME('%H', purchase_time) >= '00' AND STRFTIME('%H', purchase_time) < '06'";

    const morningToAfternoon = "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().format('YYYY[-]MM[-]DD') + "'"
      + "AND STRFTIME('%H', purchase_time) >= '06' AND STRFTIME('%H', purchase_time) < '12'";

    const afternoonToEvening = "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().format('YYYY[-]MM[-]DD') + "'"
      + "AND STRFTIME('%H', purchase_time) >= '12' AND STRFTIME('%H', purchase_time) < '18'";

    const eveningToMidnight = "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().format('YYYY[-]MM[-]DD') + "'"
      + "AND STRFTIME('%H', purchase_time) >= '18' AND STRFTIME('%H', purchase_time) < '00'";

    const db = new sqlite3.Database('html&css/assets/js/western-data.db');

    db.get(eveningToMidnight, (err, row) => {
      if (row.total_sales) {
        data.push(row.total_sales);
      } else {
        data.push(0);
      }
      db.get(midnightToMorning, (err1, row1) => {
        if (row1.total_sales) {
          data.push(row1.total_sales);
        } else {
          data.push(0);
        }
        db.get(morningToAfternoon, (err2, row2) => {
          if (row2.total_sales) {
            data.push(row2.total_sales);
          } else {
            data.push(0);
          }
          db.get(afternoonToEvening, (err3, row3) => {
            if (row3.total_sales) {
              data.push(row3.total_sales);
            } else {
              data.push(0);
            }
          });
        });
      });
    });
    db.close();
    // ----
  } else if (period === 'current-week') {
    label = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    data = [0, 10, 30, 40, 80, 60, 100];
  } else if (period === 'current-month') {
    label = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    data = [0, 0, 40, 100];
  } else if (period === 'current-year') {
    label = ['Jan', 'Feb', 'Mar', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    data = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 5000, 6000, 2000];
  } else if (period === 'past-week') {
    label = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    data = [0, 10, 30, 40, 80, 60, 100];
  } else if (period === 'past-month') {
    label = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    data = [50, 30, 60, 45];
  } else if (period === 'past-year') {
    label = ['Jan', 'Feb', 'Mar', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    data = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 5000, 6000, 2000];
  } else {
    label = ['2021', '2022', '2023', '2024', '2025'];
    data = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 5000, 6000, 2000];
  }

  displayGraphData(label, data);
}

/**
 * Call functions to load graph and metrics data
 * @param {string} period period of time to extract data for
 */
function pageRefresh(period) {
  getSalesPeriod(period);
  getGraphData(period);
}

window.onload = () => {
  pageRefresh('today');
};
