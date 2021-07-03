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
  setTimeout(() => {
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
  }, 500);
}

/**
 * Get dtaa to display in graphs from db
 * @param {string} period Period to extract data for
 */
function getGraphData(period) {
  let label;
  let data;
  const db = new sqlite3.Database('html&css/assets/js/western-data.db');
  if (period === 'today') {
    data = [0, 0, 0, 0];
    label = ['12 AM', '6 AM', '12 PM', '6 PM'];
    const queries = [
      // eveningToMidnight
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().format('YYYY[-]MM[-]DD') + "'"
      + "AND STRFTIME('%H', purchase_time) >= '18' AND STRFTIME('%H', purchase_time) < '00'",
      // Midnight to Morning
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().format('YYYY[-]MM[-]DD') + "'"
      + "AND STRFTIME('%H', purchase_time) > '00' AND STRFTIME('%H', purchase_time) <= '06'",
      // Morning to Afternoon
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().format('YYYY[-]MM[-]DD') + "'"
      + "AND STRFTIME('%H', purchase_time) > '06' AND STRFTIME('%H', purchase_time) <= '12'",
      // Afternoon to Evening
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().format('YYYY[-]MM[-]DD') + "'"
      + "AND STRFTIME('%H', purchase_time) > '12' AND STRFTIME('%H', purchase_time) <= '18'"];

    queries.forEach((query) => {
      db.get(query, (err, row) => {
        if (row) {
          if (row.total_sales) {
            data[queries.indexOf(query)] = row.total_sales;
          } else {
            data[queries.indexOf(query)] = 0;
          }
        }
      });
    });

    db.close();
  } else if (period === 'current-week') {
    label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    data = [0, 0, 0, 0, 0, 0, 0];
    const queries = [
      // Sunday
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().startOf('week').format('YYYY[-]MM[-]DD') + "'",
      // Monday
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().startOf('week').add(1, 'day').format('YYYY[-]MM[-]DD') + "'",
      // Tuesday
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().startOf('week').add(2, 'day').format('YYYY[-]MM[-]DD') + "'",
      // Wednesday
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().startOf('week').add(3, 'day').format('YYYY[-]MM[-]DD') + "'",
      // Thursday
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().startOf('week').add(4, 'day').format('YYYY[-]MM[-]DD') + "'",
      // Friday
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().startOf('week').add(5, 'day').format('YYYY[-]MM[-]DD') + "'",
      // Saturday
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().startOf('week').add(6, 'day').format('YYYY[-]MM[-]DD') + "'"];

    queries.forEach((query) => {
      db.get(query, (err, row) => {
        if (row) {
          if (row.total_sales) {
            data[queries.indexOf(query)] = row.total_sales;
          } else {
            data[queries.indexOf(query)] = 0;
          }
        }
      });
    });

    db.close();
    // ----
  } else if (period === 'current-month') {
    label = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    data = [0, 0, 0, 0];
    const queries = [
      // Week 1
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)>='"
      + moment().startOf('month').format('YYYY[-]MM[-]DD') + "' AND date(purchase_time)<='"
      + moment().startOf('month').endOf('week').format('YYYY[-]MM[-]DD') + "'",
      // Week 2
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)>='"
      + moment().startOf('month').add(1, 'week').format('YYYY[-]MM[-]DD') + "' AND date(purchase_time)<='"
      + moment().startOf('month').endOf('week').format('YYYY[-]MM[-]DD') + "'",
      // Week 3
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)>='"
      + moment().startOf('month').add(2, 'week').format('YYYY[-]MM[-]DD') + "' AND date(purchase_time)<='"
      + moment().startOf('month').endOf('week').format('YYYY[-]MM[-]DD') + "'",
      // Week 4
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)>='"
      + moment().startOf('month').add(3, 'week').format('YYYY[-]MM[-]DD') + "' AND date(purchase_time)<='"
      + moment().startOf('month').endOf('week').format('YYYY[-]MM[-]DD') + "'"];

    queries.forEach((query) => {
      db.get(query, (err, row) => {
        if (row) {
          if (row.total_sales) {
            data[queries.indexOf(query)] = row.total_sales;
          } else {
            data[queries.indexOf(query)] = 0;
          }
        }
      });
    });

    db.close();
    // ----
  } else if (period === 'current-year') {
    label = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const queries = [
      // Jan
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='01' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().year() + "'",
      // Feb
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='02' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().year() + "'",
      // Mar
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='03' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().year() + "'",
      // Apr
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='04' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().year() + "'",
      // May
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='05' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().year() + "'",
      // Jun
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='06' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().year() + "'",
      // Jul
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='07' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().year() + "'",
      // Aug
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='08' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().year() + "'",
      // Sep
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='09' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().year() + "'",
      // Oct
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='10' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().year() + "'",
      // Nov
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='11' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().year() + "'",
      // Dec
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='12' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().year() + "'"];

    queries.forEach((query) => {
      db.get(query, (err, row) => {
        if (row) {
          if (row.total_sales) {
            data[queries.indexOf(query)] = row.total_sales;
          } else {
            data[queries.indexOf(query)] = 0;
          }
        }
      });
    });

    db.close();
    // ----
  } else if (period === 'past-week') {
    label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    data = [0, 0, 0, 0, 0, 0, 0];
    const queries = [
      // Sunday
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().startOf('week').subtract(1, 'week').format('YYYY[-]MM[-]DD') + "'",
      // Monday
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().startOf('week').subtract(1, 'week').add(1, 'day')
        .format('YYYY[-]MM[-]DD') + "'",
      // Tuesday
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().startOf('week').subtract(1, 'week').add(2, 'day')
        .format('YYYY[-]MM[-]DD') + "'",
      // Wednesday
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().startOf('week').subtract(1, 'week').add(3, 'day')
        .format('YYYY[-]MM[-]DD') + "'",
      // Thursday
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().startOf('week').subtract(1, 'week').add(4, 'day')
        .format('YYYY[-]MM[-]DD') + "'",
      // Friday
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().startOf('week').subtract(1, 'week').add(5, 'day')
        .format('YYYY[-]MM[-]DD') + "'",
      // Saturday
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)='"
      + moment().startOf('week').subtract(1, 'week').add(6, 'day')
        .format('YYYY[-]MM[-]DD') + "'"];

    queries.forEach((query) => {
      db.get(query, (err, row) => {
        if (row) {
          if (row.total_sales) {
            data[queries.indexOf(query)] = row.total_sales;
          } else {
            data[queries.indexOf(query)] = 0;
          }
        }
      });
    });

    db.close();
    // ----
  } else if (period === 'past-month') {
    label = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    data = [0, 0, 0, 0];
    const queries = [
      // Week 1
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)>='"
      + moment().startOf('month').subtract(1, 'month').format('YYYY[-]MM[-]DD') + "' AND date(purchase_time)<='"
      + moment().startOf('month').subtract(1, 'month').endOf('week')
        .format('YYYY[-]MM[-]DD') + "'",
      // Week 2
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)>='"
      + moment().startOf('month').subtract(1, 'month').add(1, 'week')
        .format('YYYY[-]MM[-]DD') + "' AND date(purchase_time)<='"
      + moment().startOf('month').subtract(1, 'month').endOf('week')
        .format('YYYY[-]MM[-]DD') + "'",
      // Week 3
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)>='"
      + moment().startOf('month').subtract(1, 'month').add(2, 'week')
        .format('YYYY[-]MM[-]DD') + "' AND date(purchase_time)<='"
      + moment().startOf('month').subtract(1, 'month').endOf('week')
        .format('YYYY[-]MM[-]DD') + "'",
      // Week 4
      "SELECT SUM(total_price) as total_sales FROM sales WHERE date(purchase_time)>='"
      + moment().startOf('month').subtract(1, 'month').add(3, 'week')
        .format('YYYY[-]MM[-]DD') + "' AND date(purchase_time)<='"
      + moment().startOf('month').subtract(1, 'month').endOf('month')
        .format('YYYY[-]MM[-]DD') + "'"];

    queries.forEach((query) => {
      db.get(query, (err, row) => {
        if (row) {
          if (row.total_sales) {
            data[queries.indexOf(query)] = row.total_sales;
          } else {
            data[queries.indexOf(query)] = 0;
          }
        }
      });
    });

    db.close();
    // ----
  } else if (period === 'past-year') {
    label = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const queries = [
      // Jan
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='01' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().subtract(1, 'year').format('YYYY') + "'",
      // Feb
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='02' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().subtract(1, 'year').format('YYYY') + "'",
      // Mar
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='03' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().subtract(1, 'year').format('YYYY') + "'",
      // Apr
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='04' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().subtract(1, 'year').format('YYYY') + "'",
      // May
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='05' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().subtract(1, 'year').format('YYYY') + "'",
      // Jun
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='06' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().subtract(1, 'year').format('YYYY') + "'",
      // Jul
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='07' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().subtract(1, 'year').format('YYYY') + "'",
      // Aug
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='08' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().subtract(1, 'year').format('YYYY') + "'",
      // Sep
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='09' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().subtract(1, 'year').format('YYYY') + "'",
      // Oct
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='10' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().subtract(1, 'year').format('YYYY') + "'",
      // Nov
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='11' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().subtract(1, 'year').format('YYYY') + "'",
      // Dec
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%m', purchase_time)='12' "
      + "AND STRFTIME('%Y', purchase_time)='" + moment().subtract(1, 'year').format('YYYY') + "'"];

    queries.forEach((query) => {
      db.get(query, (err, row) => {
        if (row) {
          if (row.total_sales) {
            data[queries.indexOf(query)] = row.total_sales;
          } else {
            data[queries.indexOf(query)] = 0;
          }
        }
      });
    });

    db.close();
    // ----
  } else {
    label = [moment().subtract(3, 'year').format('YYYY'), moment().subtract(2, 'year').format('YYYY'), moment().subtract(1, 'year').format('YYYY'), moment().year()];
    data = [];
    const queries = [
      // Sunday
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%Y', purchase_time)='"
      + moment().subtract(3, 'year').format('YYYY') + "'",
      // Monday
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%Y', purchase_time)='"
      + moment().subtract(2, 'year').format('YYYY') + "'",
      // Tuesday
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%Y', purchase_time)='"
      + moment().subtract(1, 'year').format('YYYY') + "'",
      // Wednesday
      "SELECT SUM(total_price) as total_sales FROM sales WHERE STRFTIME('%Y', purchase_time)='"
      + moment().year() + "'"];

    queries.forEach((query) => {
      db.get(query, (err, row) => {
        if (row) {
          if (row.total_sales) {
            data[queries.indexOf(query)] = row.total_sales;
          } else {
            data[queries.indexOf(query)] = 0;
          }
        }
      });
    });

    db.close();
    // ----
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
  pageRefresh('current-week');
};
