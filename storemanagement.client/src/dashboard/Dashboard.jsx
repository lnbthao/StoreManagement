import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardCard from './DashboardCard';
import { toVNPrice, toVNDateTime } from '../util';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [overview, setOverview] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [orderStats, setOrderStats] = useState({ pending: 0, paid: 0, canceled: 0 });
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenuePeriod, setRevenuePeriod] = useState('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [revenuePeriod]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const [overviewRes, revenueRes, ordersRes, productsRes, recentRes] = await Promise.all([
        axios.get('/api/statistics/overview'),
        axios.get(`/api/statistics/revenue?period=${revenuePeriod}`),
        axios.get('/api/statistics/orders'),
        axios.get('/api/statistics/top-products?limit=5'),
        axios.get('/api/statistics/recent-orders?limit=5')
      ]);

      setOverview(overviewRes.data);
      setRevenueData(revenueRes.data);
      setOrderStats(ordersRes.data);
      setTopProducts(productsRes.data);
      setRecentOrders(recentRes.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const revenueChartData = {
    labels: revenueData.map(d => d.date),
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: revenueData.map(d => d.revenue),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Biểu đồ doanh thu',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value.toLocaleString('vi-VN') + ' đ';
          }
        }
      }
    }
  };

  const orderChartData = {
    labels: ['Chờ xử lý', 'Đã thanh toán', 'Đã hủy'],
    datasets: [
      {
        data: [orderStats.pending, orderStats.paid, orderStats.canceled],
        backgroundColor: [
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const orderChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Trạng thái đơn hàng',
      },
    },
  };

  const topProductsChartData = {
    labels: topProducts.map(p => p.productName),
    datasets: [
      {
        label: 'Số lượng bán',
        data: topProducts.map(p => p.totalQuantity),
        backgroundColor: 'rgba(153, 102, 255, 0.8)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const topProductsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top 5 sản phẩm bán chạy',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'warning',
      paid: 'success',
      canceled: 'danger'
    };
    const labels = {
      pending: 'Chờ xử lý',
      paid: 'Đã thanh toán',
      canceled: 'Đã hủy'
    };
    return <span className={`badge bg-${badges[status]}`}>{labels[status]}</span>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <h1 className="text-center text-uppercase mb-4 fs-2">Thống kê</h1>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-6 col-xl-3">
          <DashboardCard
            title="Tổng doanh thu"
            value={overview.totalRevenue}
            icon="currency-dollar"
            color="success"
          />
        </div>
        <div className="col-md-6 col-xl-3">
          <DashboardCard
            title="Tổng đơn hàng"
            value={overview.totalOrders}
            icon="cart-check"
            color="primary"
          />
        </div>
        <div className="col-md-6 col-xl-3">
          <DashboardCard
            title="Tổng sản phẩm"
            value={overview.totalProducts}
            icon="box-seam"
            color="info"
          />
        </div>
        <div className="col-md-6 col-xl-3">
          <DashboardCard
            title="Tổng khách hàng"
            value={overview.totalCustomers}
            icon="people"
            color="warning"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">
        {/* Revenue Chart */}
        <div className="col-lg-8">
          <div className="card h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Doanh thu</h5>
              <div className="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  className={`btn btn-outline-primary ${revenuePeriod === 'daily' ? 'active' : ''}`}
                  onClick={() => setRevenuePeriod('daily')}
                >
                  7 ngày
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-primary ${revenuePeriod === 'monthly' ? 'active' : ''}`}
                  onClick={() => setRevenuePeriod('monthly')}
                >
                  1 tháng
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-primary ${revenuePeriod === 'yearly' ? 'active' : ''}`}
                  onClick={() => setRevenuePeriod('yearly')}
                >
                  1 năm
                </button>
              </div>
            </div>
            <div className="card-body" style={{ height: '300px' }}>
              <Line data={revenueChartData} options={revenueChartOptions} />
            </div>
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Đơn hàng</h5>
            </div>
            <div className="card-body" style={{ height: '300px' }}>
              <Doughnut data={orderChartData} options={orderChartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Products and Recent Orders Row */}
      <div className="row g-3 mb-4">
        {/* Top Products Chart */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Sản phẩm bán chạy</h5>
            </div>
            <div className="card-body" style={{ height: '350px' }}>
              <Bar data={topProductsChartData} options={topProductsChartOptions} />
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Đơn hàng gần đây</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Mã ĐH</th>
                      <th>Khách hàng</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <tr key={order.orderId}>
                          <td>#{order.orderId}</td>
                          <td className="text-truncate" style={{ maxWidth: '150px' }}>
                            {order.customerName}
                          </td>
                          <td>{toVNPrice(order.finalAmount)}</td>
                          <td>{getStatusBadge(order.status)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-4">
                          Chưa có đơn hàng nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}