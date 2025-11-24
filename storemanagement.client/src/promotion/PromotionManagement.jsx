import axios from "axios";
import { useState, useEffect } from "react";
import { Eye, Search, PencilSquare, PlusCircleFill, Trash3 } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { MOCK_PROMOTIONS } from "../../mockData/Promotion";
import PromotionViewModal from "./PromotionViewModal";
import { toVNDate, toVNNumber, toVNPrice } from "../util";

export default function PromotionManagement() {
  const navTo = useNavigate();
  const [promotionList, setPromotionList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [openView, setOpenView] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);

  // ---- Load from API ----
  const loadFromApi = async (keyword = "") => {
    const url = keyword.trim()
      ? `/api/promotion?code=${keyword}`
      : `/api/promotion`;

    const res = await axios.get(url);
    return res.data;
  };

  useEffect(() => {
    (async () => {
      document.title = "Mã khuyến mãi | Quản lý kho hàng";
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

  const fmtValue = (p) =>
    p.discountType === "percent" ? `${p.discountValue}%` : toVNPrice(p.discountValue);

  const openPromoModal = (promo) => {
    setSelectedPromo(promo || null);
    setOpenView(true);
  };

  const closePromoModal = () => {
    setOpenView(false);
    setSelectedPromo(null);
  };

  // ---- Search action (Enter or button click) ----
  const handleSubmitSearch = async (e) => {
    if (e) e.preventDefault();
    try {
      const data = await loadFromApi(search);
      setPromotionList(data);
    } catch {
      alert("Không thể tìm kiếm!");
    }
  };

  // ---- Delete ----
  const handleDelete = async (p) => {
    if (!window.confirm(`Bạn có chắc muốn xoá khuyến mãi #${p.promoId}?`)) return;

    try {
      await axios.delete(`/api/promotion/${p.promoId}`);
      setPromotionList((old) =>
        old.map((x) =>
          x.promoId === p.promoId
            ? { ...x, status: x.status === "active" ? "inactive" : "active" }
            : x
        )
      );
    } catch {
      alert("Xoá thất bại!");
    }
  };

  if (loading) return null;

  return (
    <>
      <h1 className="text-center text-uppercase mb-3 fs-2">
        Quản lý khuyến mãi
      </h1>

      {/* ---------- SEARCH + ADD ---------- */}
      <div className="d-flex column-gap-3 mb-3">

        <button
          className="btn btn-success"
          onClick={() => navTo("/admin/promotion/add")}
        >
          <PlusCircleFill className="me-1" />
          Thêm khuyến mãi
        </button>

        <form className="col d-flex" onSubmit={handleSubmitSearch}>
          <input
            type="search"
            placeholder="Nhập mã khuyến mãi"
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary ms-2">
            <Search size={20} />
          </button>
        </form>
      </div>

      {/* ---------- TABLE ---------- */}
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

                <td className="text-center d-flex justify-content-center gap-2">
                  <button
                    className="btn p-0"
                    onClick={() => navTo(`/admin/promotion/edit/${p.promoId}`)}
                    title="Sửa"
                  >
                    <PencilSquare size={22} color="darkblue" />
                  </button>

                  {/* <button
                    className="btn p-0"
                    onClick={() => handleDelete(p)}
                    title="Xóa"
                  >
                    <Trash3 size={22} color="red" />
                  </button> */}
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
    </>
  );
}
