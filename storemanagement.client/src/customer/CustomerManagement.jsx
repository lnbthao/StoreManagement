import axios from "axios";
import { useEffect, useState } from "react";
import { Eye, Funnel, PencilSquare, PlusCircleFill, Trash3, ArrowClockwise } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import CustomerViewModal from "./CustomerViewModal";
import CustomerFilterModal from "./CustomerFilterModal";
import { splitPhoneNumber } from "../util";

export default function CustomerManagement() {
  const navTo = useNavigate();
  const [customerList, setCustomerList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openView, setOpenView] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [openFilter, setOpenFilter] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  
  const loadFromApi = async (q = "", filters = {}) => {
    const params = {};
    const name = (q || "").trim();
    if (name) params.name = name;
    
    if (filters.hasPhone !== '') params.hasPhone = filters.hasPhone;
    if (filters.hasEmail !== '') params.hasEmail = filters.hasEmail;
    if (filters.hasAddress !== '') params.hasAddress = filters.hasAddress;
    
    if (filters.status === '' || filters.status === 'inactive') {
      params.includeInactive = true;
    } else {
      params.includeInactive = false;
    }
    
    if (filters.createdFrom) params.createdFrom = filters.createdFrom;
    if (filters.createdTo) params.createdTo = filters.createdTo;
    
    const res = await axios.get("/api/customer", { params });
    let data = res.data;
    if (filters.status === 'inactive') {
      data = data.filter(c => !c.isActive);
    }
    
    return data;
  };

  const handleSearch = (value) => {
    setSearch(value);
  };

  const handleFilter = (filters) => {
    setCurrentFilters(filters);
    loadFromApi(search, filters).then((data) => setCustomerList(data));
  };

  const handleClearFilter = () => {
    setCurrentFilters({});
    loadFromApi(search, {}).then((data) => setCustomerList(data));
  };

  const hasActiveFilters = Object.values(currentFilters).some(value => value !== '' && value !== undefined && value !== null);

  // Debouncing cho search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search !== undefined) {
        loadFromApi(search, currentFilters)
          .then(data => setCustomerList(data))
          .catch(err => {
            console.log(err);
          });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, currentFilters]);

  useEffect(() => {
    (async () => {
      document.title = "Khách hàng | Quản lý kho hàng";
      try {
        const data = await loadFromApi();
        setCustomerList(data);
      } catch(err) {
        console.log(err);
        alert("Lấy danh sách khách hàng thất bại!");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openCustomerModal = (cus) => {
    setSelectedCustomer(cus || null);
    setOpenView(true);
  };
  const closeCustomerModal = () => {
    setOpenView(false);
    setSelectedCustomer(null);
  };

  const handleDelete = (customer) => {
    if (
      window.confirm(
        `Bạn có chắc muốn xoá khách hàng #${customer.customerId}: ${customer.customerName}?`
      )
    ) {
      axios
        .delete(`/api/customer/${customer.customerId}`)
        .then(() => {
          setCustomerList((prev) => prev.filter((c) => c.customerId !== customer.customerId));
          alert(`Đã xoá khách hàng #${customer.customerId} thành công!`);
        })
        .catch((err) => {
          console.error(err);
          alert(`Xoá khách hàng #${customer.customerId} thất bại!`);
        });
    }
  };

  if (loading) return null;

  return (
    <>
      <h1 className="text-center text-uppercase mb-3 fs-2">
        Quản lý khách hàng{" "}
      </h1>

      <div className="d-flex column-gap-3 mb-3">
        <button
          className="btn btn-success d-flex align-items-center column-gap-1"
          onClick={() => navTo("/admin/customer/add")}
        >
          <PlusCircleFill className="me-1" /> Thêm khách hàng
        </button>

        <form className="col" onSubmit={(e) => e.preventDefault()}>
          <input
            type="search"
            placeholder="Nhập dữ liệu tìm kiếm"
            className="form-control"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </form>
        <button
          className="btn btn-outline-secondary"
          title="Lọc"
          aria-label="Lọc"
          onClick={() => setOpenFilter(true)}
        >
          <Funnel size={22} />
          Bộ lọc
        </button>
        {hasActiveFilters && (
          <button
            className="btn btn-outline-secondary"
            title="Làm mới"
            aria-label="Làm mới"
            onClick={handleClearFilter}
          >
            <ArrowClockwise size={22} />
          </button>
        )}
      </div>

      <table className="table table-striped table-hover table-bordered">
        <thead>
          <tr className="text-center">
            <th>ID</th>
            <th>Tên khách hàng</th>
            <th>Điện thoại</th>
            <th>Email</th>
            <th>Địa chỉ</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {customerList.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center fst-italic">
                Không có khách hàng!
              </td>
            </tr>
          ) : (
            customerList.map((c) => (
              <tr key={`customer-${c.customerId}`}>
                <td>{c.customerId}</td>
                <td className="text-center">{c.customerName}</td>
                <td className="text-center">{splitPhoneNumber(c.phone)}</td>
                <td className="text-center">{c.email}</td>
                <td className="text-center">{c.address}</td>
                <td className="text-center">
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleString("vi-VN")
                    : ""}
                </td>
                <td className="text-center">
                {
                  c.isActive ? (
                    <>
                      <button
                        className="btn p-0 me-2 border border-0"
                        title="Xem chi tiết"
                        onClick={() => openCustomerModal(c)}
                      >
                        <Eye size={22} color="darkcyan" />
                      </button>
                      <button
                        className="btn p-0 me-2 border border-0"
                        onClick={() => navTo(`/admin/customer/edit/${c.customerId}`)}
                        title="Sửa"
                      >
                        <PencilSquare size={22} color="darkblue" />
                      </button>
                      <button
                        className="btn p-0 border border-0"
                        title="Xoá"
                        onClick={() => handleDelete(c)}
                      >
                        <Trash3 size={22} color="crimson" />
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn p-0 me-2 border border-0"
                      title="Xem chi tiết"
                      onClick={() => openCustomerModal(c)}
                    >
                      <Eye size={22} color="darkcyan" />
                    </button>
                  )
                }
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <CustomerViewModal
        open={openView}
        customer={selectedCustomer}
        onClose={closeCustomerModal}
      />
      <CustomerFilterModal
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        onFilter={handleFilter}
        currentFilters={currentFilters}
      />
    </>
  );
}
