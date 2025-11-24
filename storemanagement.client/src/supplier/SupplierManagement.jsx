import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MOCK_SUPPLIERS } from "../../mockData/Supplier";
import { splitPhoneNumber } from "../util";
import { ArrowClockwise, Eye, PencilSquare, PlusCircleFill, Trash3 } from "react-bootstrap-icons";
import SupplierViewModal from "./SupplierViewModal";

export default function SupplierManagement() {
  const navTo = useNavigate();
  const [supplierList, setSupplierList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openView, setOpenView] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [statusFilter, setStatusFilter] = useState("active"); 

  // Load danh sách từ API
  const loadFromApi = async (q = "") => {
    try {
      const url = "/api/supplier" + (q ? `?name=${q}` : "");
      const res = await axios.get(url);
      setSupplierList(res.data);
    } catch {
      setSupplierList(MOCK_SUPPLIERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFromApi();
  }, []);

  const handleSearch = (value) => {
    setSearch(value);
    loadFromApi(value); // gọi API tìm kiếm khi nhập
  };

  const filteredList = supplierList.filter((s) => {
  if (statusFilter === "active") return s.isActive;
  if (statusFilter === "inactive") return !s.isActive;
  return true; // all
});

  const statusBadge = (active) => {
    const s = active ? "active" : "inactive";
    const map = { active: "success", inactive: "danger" };
    const color = map[s] || "danger";
    return <span className={`badge text-bg-${color}`}>{s}</span>;
  };

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setOpenView(true);
  };

  const handleCloseView = () => {
    setOpenView(false);
    setSelectedSupplier(null);
  };

  const handleActive = async (s) => {
    if (confirm(`Bạn có muốn ${s.isActive ? "xóa" : "khôi phục"} nhà cung cấp #${s.supplierId}?`)) {
      try {
        if (s.isActive) {
          await axios.delete(`/api/supplier/${s.supplierId}`);
          s.isActive = false;
        } else {
          await axios.put(`/api/supplier/${s.supplierId}/restore`);
          s.isActive = true;
        }

        alert(`Đã ${s.isActive ? "khôi phục" : "xóa"} nhà cung cấp thành công!`);
        loadFromApi(search); // reload danh sách sau khi thay đổi trạng thái
      } catch (err) {
        alert("Có lỗi xảy ra!");
        console.error(err);
      }
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <h1 className="text-center text-uppercase mb-3 fs-2">Quản lý nhà cung cấp</h1>

      <div className="d-flex column-gap-3 mb-3">
        <button
          className="btn btn-success d-flex align-items-center column-gap-1"
          onClick={() => navTo("/admin/supplier/add")}
        >
          <PlusCircleFill className="me-1" /> Thêm nhà cung cấp
        </button>
        <select
        className="form-select w-auto ms-2"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
            >   
        <option value="all">Tất cả</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        </select>
        <form className="col" onSubmit={(e) => e.preventDefault()}>
          <input
            type="search"
            placeholder="Nhập dữ liệu tìm kiếm"
            className="form-control"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </form>
      </div>

      <table className="table table-striped table-hover table-bordered">
        <thead>
          <tr className="text-center">
            <th>ID</th>
            <th>Tên nhà cung cấp</th>
            <th>Điện thoại</th>
            <th>Email</th>
            <th>Địa chỉ</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {filteredList.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center fst-italic">
                Không có nhà cung cấp!
              </td>
            </tr>
          ) : (
            filteredList.map((s) => (
              <tr key={s.supplierId}>
                <td className="text-center">{s.supplierId}</td>
                <td className="text-center">{s.supplierName}</td>
                <td className="text-center">{splitPhoneNumber(s.phone)}</td>
                <td className="text-center">{s.email}</td>
                <td className="text-center">{s.address}</td>
                <td className="text-center">{statusBadge(s.isActive)}</td>
                <td className="text-center">
                  {s.isActive ? (
                    <>
                                <button
                                    className="btn p-0 me-2 border border-0"
                                    onClick={() => handleViewSupplier(s)}
                                    title="Xem"
                                >
                                    <Eye color="darkcyan" />
                                </button>
                                <button
                                    className="btn p-0 me-2 border border-0"
                                    onClick={() => navTo(`/admin/supplier/edit/${s.supplierId}`)}
                                    title="Cập nhật"
                                >
                                    <PencilSquare color="darkblue" />
                                </button>
                                <button
                                    className="btn p-0 me-2 border border-0"
                                    onClick={() => handleActive(s)}
                                    title="Xóa"
                                >
                                    <Trash3 color="crimson" />
                                </button>

                    </>
                  ) : (
                    <button className="btn p-0 me-2 border border-0" onClick={() => handleActive(s)} title="Khôi phục">
                      <ArrowClockwise color="darkcyan" />
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <SupplierViewModal open={openView} supplier={selectedSupplier} onClose={handleCloseView} />
    </>
  );
}
