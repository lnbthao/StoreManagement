import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_SUPPLIERS } from "../../mockData/Supplier";
import { splitPhoneNumber } from "../util";
import { ArrowClockwise, DatabaseUp, Eye, PencilSquare, PlusCircleFill, Trash3 } from "react-bootstrap-icons";
import SupplierViewModal from "./SupplierViewModal";

export default function SupplierManagement() {
  const navTo = useNavigate();
  const [supplierList, setSupplierList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openView, setOpenView] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const loadFromApi = async (q = "") => {
    const url = `/api/supplier`;
    const res = await axios.get(url);
    return res.data;
  };

  useEffect(() => {
    (async () => {
      document.title = "Nhà cung cấp | Quản lý kho hàng";
      try {
        const data = await loadFromApi();
        setSupplierList(data);
      } catch {
        setSupplierList(MOCK_SUPPLIERS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  const handleSearch = (value) => {
    setSearch(value);
    // TODO: gọi hàm loadFromApi để tiến hành tìm kiếm
  };

  const handleActive = async (s) => {
    if (confirm(`Bạn có muốn ${s.isActive ? "xóa" : "khôi phục"} nhà cung cấp #${s.supplierId}: ${s.supplierName || ""}?`)) {
      // TODO: gọi API xoá rồi cập nhật state:

      alert(`Đã ${s.isActive ? "xóa" : "khôi phục"} (demo)!`);
      navTo(0); // Tải lại trang
    }
  };

  return loading ? (
    <></>
  ) : (
    <>
      <h1 className="text-center text-uppercase mb-3 fs-2">
        Quản lý nhà cung cấp
      </h1>

      <div className="d-flex column-gap-3 mb-3">
        <button
          className="btn btn-success d-flex align-items-center column-gap-1"
          onClick={() => navTo("/admin/supplier/add")}
        >
          <PlusCircleFill className="me-1" /> Thêm nhà cung cấp
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
          {supplierList.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center fst-italic">
                Không có nhà cung cấp!
              </td>
            </tr>
          ) : (
            supplierList.map((s) => (
              <tr key={`supplier-${s.supplierId}`}>
                <td>{s.supplierId}</td>
                <td className="text-center">{s.supplierName}</td>
                <td className="text-center">{splitPhoneNumber(s.phone)}</td>
                <td className="text-center">{s.email}</td>
                <td className="text-center">{s.address}</td>
                <td className="text-center">{statusBadge(s.isActive)}</td>
                <td className="text-center">
                {
                  s.isActive ? (
                    <>
                      <button
                        className="btn p-0 me-2 border border-0"
                        title="Xem chi tiết"
                        onClick={() => handleViewSupplier(s)}
                      >
                        <Eye size={22} color="darkcyan" />
                      </button>
                      <button
                        className="btn p-0 me-2 border border-0"
                        onClick={() => navTo(`/admin/supplier/edit/${s.supplierId}`)}
                        title="Cập nhật"
                      >
                        <PencilSquare size={22} color="darkblue" />
                      </button>
                      <button
                        className="btn p-0 border border-0"
                        title="Xóa"
                        onClick={() => handleActive(s)}
                      >
                        <Trash3 size={22} color="crimson" />
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn p-0 border border-0"
                      title="Khôi phục"
                      onClick={() => handleActive(s)}
                    >
                      <ArrowClockwise size={22} color="darkcyan" />
                    </button>
                  )
                }
                  
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <SupplierViewModal
        open={openView}
        supplier={selectedSupplier}
        onClose={handleCloseView}
      />
    </>
  );
}
