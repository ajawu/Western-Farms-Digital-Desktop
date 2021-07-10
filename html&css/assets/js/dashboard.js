const Database = require('better-sqlite3');
const moment = require('moment');
const Chartist = require('chartist');
const numeral = require('numeral');
const swal = require('sweetalert');
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
 * Fetch sales within a given period from the database and displays it
 * @param {string} period period of time to fetch sales
 */
function getSalesPeriod(period) {
  let startDate;
  let endDate;
  let salesQuery;

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
  const db = new Database('html&css/assets/js/western-data.db', { verbose: console.log });

  try {
    if (period === 'all') {
      salesQuery = db.prepare(`SELECT SUM(total_revenue) as total_revenue, SUM(total_price)
     as total_sales, COUNT(customer_name) as customer_count FROM sales`);
    } else {
      salesQuery = db.prepare("SELECT SUM(total_revenue) as total_revenue, SUM(total_price) as total_sales, "
        + "COUNT(customer_name) as customer_count FROM sales WHERE strftime('%Y-%m-%d', `purchase_time`)>='"
        + startDate + "' AND strftime('%Y-%m-%d', `purchase_time`)<='" + endDate + "'");
    }

    const salesData = salesQuery.get();
    displayData(salesData.total_revenue, salesData.total_sales, salesData.customer_count);
    changePeriodText(period);
  } catch (err) {
    swal("Oops!", err.message, "error");
  }
  db.close();
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
    options: {
      spanGaps: true, // this is the property I found
    },
  });
}

/**
 * Get data to display in graphs from db
 * @param {string} period Period to extract data for
 */
function getGraphData(period) {
  let label;
  const data = [];
  let query;
  let periods = [];
  // Create and execute db query
  const db = new Database('html&css/assets/js/western-data.db', { verbose: console.log });

  if (period === 'today') {
    label = ['12 AM', '6 AM', '12 PM', '6 PM'];
    query = db.prepare(`SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)=date('now')
      AND STRFTIME('%H', purchase_time) > @start AND STRFTIME('%H', purchase_time) <= @stop`);

    periods = [
      { start: '18', stop: '00' }, // eveningToMidnight
      { start: '00', stop: '06' }, // Midnight to Morning
      { start: '06', stop: '12' }, // Morning to Afternoon
      { start: '12', stop: '18' }, // Afternoon to Evening
    ];
    // -----
  } else if (period === 'current-week') {
    label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    query = db.prepare(`SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)=@day`);

    periods = [
      { day: moment().startOf('week').format('YYYY[-]MM[-]DD') }, // Sunday
      { day: moment().startOf('week').add(1, 'day').format('YYYY[-]MM[-]DD') }, // Monday
      { day: moment().startOf('week').add(2, 'day').format('YYYY[-]MM[-]DD') }, // Tuesday
      { day: moment().startOf('week').add(3, 'day').format('YYYY[-]MM[-]DD') }, // Wednesday
      { day: moment().startOf('week').add(4, 'day').format('YYYY[-]MM[-]DD') }, // Thursday
      { day: moment().startOf('week').add(5, 'day').format('YYYY[-]MM[-]DD') }, // Friday
      { day: moment().startOf('week').add(6, 'day').format('YYYY[-]MM[-]DD') }, // Saturday
    ];
    // ----
  } else if (period === 'current-month') {
    label = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    query = db.prepare(`SELECT SUM(total_price) as total_sales FROM sales WHERE 
      date(purchase_time) >= @start AND date(purchase_time) <= @stop`);

    periods = [
      { // Week 1
        start: moment().startOf('month').format('YYYY[-]MM[-]DD'),
        stop: moment().startOf('month').endOf('week').format('YYYY[-]MM[-]DD'),
      },
      { // Week 2
        start: moment().startOf('month').add(1, 'week').startOf('week')
          .format('YYYY[-]MM[-]DD'),
        stop: moment().startOf('month').add(1, 'week').endOf('week')
          .format('YYYY[-]MM[-]DD'),
      },
      { // Week 3
        start: moment().startOf('month').add(2, 'week').startOf('week')
          .format('YYYY[-]MM[-]DD'),
        stop: moment().startOf('month').add(2, 'week').endOf('week')
          .format('YYYY[-]MM[-]DD'),
      },
      { // Week 4
        start: moment().startOf('month').add(3, 'week').startOf('week')
          .format('YYYY[-]MM[-]DD'),
        stop: moment().endOf('month').format('YYYY[-]MM[-]DD'),
      },
    ];
    // ----
  } else if (period === 'current-year') {
    label = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    query = db.prepare(`SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time) = @month
      AND STRFTIME('%Y', purchase_time) = @year`);

    periods = [
      { month: '01', year: `${moment().year()}` }, // January
      { month: '02', year: `${moment().year()}` }, // February
      { month: '03', year: `${moment().year()}` }, // March
      { month: '04', year: `${moment().year()}` }, // April
      { month: '05', year: `${moment().year()}` }, // May
      { month: '06', year: `${moment().year()}` }, // June
      { month: '07', year: `${moment().year()}` }, // July
      { month: '08', year: `${moment().year()}` }, // August
      { month: '09', year: `${moment().year()}` }, // September
      { month: '10', year: `${moment().year()}` }, // October
      { month: '11', year: `${moment().year()}` }, // November
      { month: '12', year: `${moment().year()}` }, // December
    ];
    // ----
  } else if (period === 'past-week') {
    label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    query = db.prepare(`SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)=@day`);

    periods = [
      { day: moment().startOf('week').subtract(1, 'week').format('YYYY[-]MM[-]DD') }, // Sunday
      { // Monday
        day: moment().startOf('week').subtract(1, 'week').add(1, 'day')
          .format('YYYY[-]MM[-]DD'),
      },
      { // Tuesday
        day: moment().startOf('week').subtract(1, 'week').add(2, 'day')
          .format('YYYY[-]MM[-]DD'),
      },
      { // Wednesday
        day: moment().startOf('week').subtract(1, 'week').add(3, 'day')
          .format('YYYY[-]MM[-]DD'),
      },
      { // Thursday
        day: moment().startOf('week').subtract(1, 'week').add(4, 'day')
          .format('YYYY[-]MM[-]DD'),
      },
      { // Friday
        day: moment().startOf('week').subtract(1, 'week').add(5, 'day')
          .format('YYYY[-]MM[-]DD'),
      },
      { // Saturday
        day: moment().startOf('week').subtract(1, 'week').add(6, 'day')
          .format('YYYY[-]MM[-]DD'),
      },
    ];
    // ----
  } else if (period === 'past-month') {
    label = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    query = db.prepare(`SELECT SUM(total_price) as total_sales FROM sales WHERE 
      date(purchase_time) >= @start AND date(purchase_time) <= @stop`);

    periods = [
      { // Week 1
        start: moment().startOf('month').subtract(1, 'month').format('YYYY[-]MM[-]DD'),
        stop: moment().startOf('month').subtract(1, 'month').endOf('week')
          .format('YYYY[-]MM[-]DD'),
      },
      { // Week 2
        start: moment().startOf('month').subtract(1, 'month').add(1, 'week')
          .format('YYYY[-]MM[-]DD'),
        stop: moment().startOf('month').subtract(1, 'month').add(1, 'week')
          .endOf('week')
          .format('YYYY[-]MM[-]DD'),
      },
      { // Week 3
        start: moment().startOf('month').subtract(1, 'month').add(2, 'week')
          .format('YYYY[-]MM[-]DD'),
        stop: moment().startOf('month').subtract(1, 'month').add(2, 'week')
          .endOf('week')
          .format('YYYY[-]MM[-]DD'),
      },
      { // Week 4
        start: moment().startOf('month').subtract(1, 'month').add(3, 'week')
          .format('YYYY[-]MM[-]DD'),
        stop: moment().startOf('month').subtract(1, 'month').endOf('month')
          .format('YYYY[-]MM[-]DD'),
      },
    ];
    // ----
  } else if (period === 'past-year') {
    label = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    query = db.prepare(`SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time) = @month
      AND STRFTIME('%Y', purchase_time) = @year`);

    periods = [
      { month: '01', year: `${moment().subtract(1, 'year').format('YYYY')}` }, // January
      { month: '02', year: `${moment().subtract(1, 'year').format('YYYY')}` }, // February
      { month: '03', year: `${moment().subtract(1, 'year').format('YYYY')}` }, // March
      { month: '04', year: `${moment().subtract(1, 'year').format('YYYY')}` }, // April
      { month: '05', year: `${moment().subtract(1, 'year').format('YYYY')}` }, // May
      { month: '06', year: `${moment().subtract(1, 'year').format('YYYY')}` }, // June
      { month: '07', year: `${moment().subtract(1, 'year').format('YYYY')}` }, // July
      { month: '08', year: `${moment().subtract(1, 'year').format('YYYY')}` }, // August
      { month: '09', year: `${moment().subtract(1, 'year').format('YYYY')}` }, // September
      { month: '10', year: `${moment().subtract(1, 'year').format('YYYY')}` }, // October
      { month: '11', year: `${moment().subtract(1, 'year').format('YYYY')}` }, // November
      { month: '12', year: `${moment().subtract(1, 'year').format('YYYY')}` }, // December
    ];
    // ----
  } else {
    label = [moment().subtract(3, 'year').format('YYYY'), moment().subtract(2, 'year').format('YYYY'),
    moment().subtract(1, 'year').format('YYYY'), moment().year()];

    query = db.prepare(`SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%Y', purchase_time)= @year`);

    periods = [
      { year: `${moment().subtract(3, 'year').format('YYYY')}` }, // Three years ago
      { year: `${moment().subtract(2, 'year').format('YYYY')}` }, // Two years ago
      { year: `${moment().subtract(1, 'year').format('YYYY')}` }, // One years ago
      { year: `${moment().year()}` }, // This year
    ];
    // ----
  }

  // Execute queries
  try {
    const periodTransaction = db.transaction((variables) => {
      variables.forEach((variable) => {
        const periodCount = query.get(variable);
        data.push(periodCount.total_sales || 0);
      });
    });
    periodTransaction(periods);
    displayGraphData(label, data);
  } catch (error) {
    swal("Oops", error.message, "error");
  }
  db.close();
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
  pageRefresh('all');
  // Display Name
  try {
    document.getElementById('full-name').textContent = JSON.parse(window.localStorage.getItem('auth')).name;
  } catch (err) {
    console.log('Element missing');
  }

  // Hide Elements from non admin users
  const isAdmin = JSON.parse(window.localStorage.getItem('auth')).admin;
  if (`${isAdmin}` === '0') {
    const adminOnlyElements = document.getElementsByClassName('admin-only-button');
    for (const adminAlone of adminOnlyElements) {
      adminAlone.classList.add('d-none');
    }
  }
};
