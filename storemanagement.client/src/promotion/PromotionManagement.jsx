import axios from "axios";
import { useState, useEffect } from "react";
import { Eye, Funnel, PencilSquare, PlusCircleFill, Trash3 } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { MOCK_PROMOTIONS } from "../../mockData/Promotion";
import PromotionViewModal from "./PromotionViewModal";
import PromotionFilterModal from "./PromotionFilterModal";
import { toVNDate, toVNNumber, toVNPrice } from "../util";

export default function PromotionManagement() {
  const navTo = useNavigate();
  const [promotionList, setPromotionList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openView, setOpenView] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [openFilter, setOpenFilter] = useState(false);

  const loadFromApi = async (q = "") => {
    const url = `/api/promotion`;
    const res = await axios.get(url);
    return res.data;
  };

  useEffect(() => {
    (async () => {
      document.title = "Sản phẩm | Quản lý kho hàng";
      try {
        const data = await loadFromApi();
        setPromotionList(data);
      } catch {
        setPromotionList(MOCK_PROMOTIONS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusBadge = (raw) => {
    const s = String(raw || "").toLowerCase();
    const map = { active: "success", inactive: "danger" };
    const color = map[s] || "danger";
    return <span className={`badge text-bg-${color}`}>{raw}</span>;
  };

  const fmtValue = p => p.discountType === "percent" ? `${p.discountValue}%` : toVNPrice(p.discountValue);

  const openPromoModal = (promo) => {
    setSelectedPromo(promo || null);
    setOpenView(true);
  };

  const closePromoModal = () => {
    setOpenView(false);
    setSelectedPromo(null);
  };

  const handleSearch = (value) => {
    setSearch(value);
    // TODO: gọi hàm loadFromApi để tiến hành tìm kiếm
  };

  const handleDelete = async (p) => {
    if (
      !window.confirm(`Xóa khuyến mãi #${p.promoId}: ${p.promoCode || ""}?`)
    ) {
      alert("Đã xoá (demo)!");
      // TODO: gọi API xoá rồi cập nhật state:
    }
  };

  return loading ? (
    <></>
  ) : (
    <>
      <h1 className="text-center text-uppercase mb-3 fs-2">
        Quản lý khuyến mãi{" "}
      </h1>

      <div className="d-flex column-gap-3 mb-3">
        <button
          className="btn btn-success"
          onClick={() => navTo("/admin/promotion/add")}
        >
          <PlusCircleFill className="me-1" /> Thêm khuyến mãi
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
            <th>Mã KM</th>
            <th>Mô tả</th>
            <th>Giá trị</th>
            <th>Bắt đầu</th>
            <th>Kết thúc</th>
            <th>Đơn tối thiểu</th>
            <th>Giới hạn</th>
            <th>Đã dùng</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {promotionList.length === 0 ? (
            <tr>
              <td colSpan={12} className="text-center fst-italic">
                Không có khuyến mãi!
              </td>
            </tr>
          ) : (
            promotionList.map((p) => (
              <tr key={`promo-${p.promoId}`}>
                <td>{p.promoId}</td>
                <td className="text-center">{p.promoCode}</td>
                <td>{p.description}</td>
                <td className="text-center">{fmtValue(p)}</td>
                <td className="text-center">{toVNDate(p.startDate)}</td>
                <td className="text-center">{toVNDate(p.endDate)}</td>
                <td className="text-center">{toVNPrice(p.minOrderAmount)}</td>
                <td className="text-center">{toVNNumber(p.usageLimit)}</td>
                <td className="text-center">{p.usedCount}</td>
                <td className="text-center">{p.status}</td>
                <td className="text-center">
                  <button
                    className="btn p-0 me-2"
                    title="Xem chi tiết"
                    onClick={() => openPromoModal(p)}
                  >
                    <Eye size={22} color="darkcyan" />
                  </button>
                  <button
                    className="btn p-0 me-2"
                    onClick={() => navTo(`/admin/promotion/edit/${p.promoId}`)}
                    title="Sửa"
                  >
                    <PencilSquare size={22} color="darkblue" />
                  </button>
                  <button
                    className="btn p-0"
                    title="Xóa"
                    onClick={() => handleDelete(p)}
                  >
                    <Trash3 size={22} color="crimson" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <PromotionViewModal
        open={openView}
        promo={selectedPromo}
        onClose={closePromoModal}
      />
      <PromotionFilterModal
        open={openFilter}
        onClose={() => setOpenFilter(false)}
      />
    </>
  );
}
