import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Eye, Funnel, PencilSquare, PlusCircleFill, Trash3 } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { MOCK_CUSTOMERS } from "../../mockData/Customer";
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

  const loadFromApi = async (q = "") => {
    const url = `/api/customer`;
    const res = await axios.get(url);
    return res.data;
  };

  const handleSearch = (value) => {
    setSearch(value);
    // TODO: gọi hàm loadFromApi để tiến hành tìm kiếm
  };

  useEffect(() => {
    (async () => {
      document.title = "Khách hàng | Quản lý kho hàng";
      try {
        const data = await loadFromApi();
        setCustomerList(data);
      } catch {
        setCustomerList(MOCK_CUSTOMERS);
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
        `Bạn có chắc muốn xoá khách hàng #${customer.customerId}: ${customer.name}?`
      )
    ) {
      alert("Đã xoá (demo)!");
      // TODO: gọi API xoá rồi cập nhật state:
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
      />
    </>
  );
}
