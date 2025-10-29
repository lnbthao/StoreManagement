import axios from "axios";
import { useState, useEffect } from "react";
import { ArrowClockwise, DatabaseUp, Eye, Funnel, PencilSquare, PlusCircleFill, Trash3 } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { toVNNumber, toVNPrice } from "../util";
import { MOCK_PRODUCTS } from "../../mockData/Products";
import ProductViewModal from "./ProductViewModal";
import ProductFilterModal from "./ProductFilterModal";
import InventoryModal from "./InventoryModal";

export default function ProductManagement() {
  const navTo = useNavigate();
  const [productList, setProductList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openView, setOpenView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openFilter, setOpenFilter] = useState(false);
  const [openInventory, setOpenInventory] = useState(false);

  const loadFromApi = async (q = "") => {
    const url = `/api/product`;
    const res = await axiop.get(url);
    return rep.data;
  };

  useEffect(() => {
    (async () => {
      document.title = "Sản phẩm | Quản lý kho hàng";
      try {
        const data = await loadFromApi();
        setProductList(data);
      } catch {
        setProductList(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusBadge = (active) => {
    const s = active ? "bán" : "ngừng bán";
    const map = { active: "success", inactive: "danger" };
    const color = map[s] || "danger";
    return <span className={`badge text-bg-${color}`}>{s}</span>;
  };

  const handleView = (prod) => {
    setSelectedProduct(prod);
    setOpenView(true);
  };
  const closeView = () => {
    setOpenView(false);
    setSelectedProduct(null);
  };

  const handleSearch = (value) => {
    setSearch(value);
    // TODO: gọi hàm loadFromApi để tiến hành tìm kiếm (nên kết hợp cả tìm kiếm tên và tìm kiếm theo barcode)
  };

  const handleActive = async (p) => {
    if (confirm(`Bạn có muốn ${p.isActive ? "xóa" : "khôi phục"}  sản phẩm #${p.productId}: ${p.productName || ""}?`)) {
      // TODO: gọi API xoá rồi cập nhật state:

      alert(`Đã ${p.isActive ? "xóa" : "khôi phục"} (demo)!`);
      navTo(0); // Tải lại trang
    }
  };

  return loading ? (
    <></>
  ) : (
    <>
      <h1 className="text-center text-uppercase mb-3 fs-2">Quản lý sản phẩm</h1>

      <div className="d-flex column-gap-3 mb-3">
        <button
          className="btn btn-success d-flex align-items-center column-gap-1"
          onClick={() => navTo("/admin/product/add")}
        >
          <PlusCircleFill className="me-1" /> Thêm sản phẩm
        </button>

        <form className="col">
          <input
            type="search"
            placeholder="Nhập tên hoặc mã barcode cần tìm"
            className="form-control"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </form>
        <button
          className="btn btn-outline-secondary d-flex align-items-center column-gap-1"
          title="Lọc"
          aria-label="Lọc"
          onClick={() => setOpenFilter(true)}
        >
          <Funnel size={22} />
          Bộ lọc
        </button>
      </div>

      <table className="table table-striped table-hover table-bordered align-middle">
        <thead>
          <tr className="text-center align-middle">
            <th>Barcode</th>
            <th>Tên sản phẩm</th>
            <th>Loại sản phẩm</th>
            <th>Tồn kho</th>
            <th>Giá</th>
            <th>Đơn vị tính</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {productList.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center fst-italic">
                Không có sản phẩm!
              </td>
            </tr>
          ) : (
            productList.map(p => (
              <tr key={`product-${p.productId}`}>
                <td className="text-center">{p.barcode}</td>
                <td className="text-center">{p.productName}</td>
                <td className="text-center">{p.category.categoryName}</td>
                <td className="text-center">
                  {
                    p.isActive ? toVNNumber(p.inventory.quantity) : statusBadge(p.isActive)
                  }
                </td>
                <td className="text-center">{toVNPrice(p.price)}</td>
                <td className="text-center">{p.unit}</td>
                <td className="text-center">
                {
                  p.isActive ? (
                    <>                    
                      <button
                        className="btn p-0 me-2 border border-0"
                        onClick={() => handleView(p)}
                      >
                        <Eye size={22} color="darkcyan" />
                      </button>
                      <button
                        className="btn p-0 me-2 border border-0"
                        onClick={() => navTo(`/admin/product/edit/${p.productId}`)}
                      >
                        <PencilSquare size={22} color="darkblue" />
                      </button>
                      <button
                        className="btn p-0 me-2 border border-0"
                        onClick={() => setOpenInventory(true)}
                      >
                        <DatabaseUp size={22} color="chocolate" />
                      </button>
                      <button
                        className="btn p-0 border border-0"
                        title="Xóa"
                        onClick={() => handleActive(p)}
                      >
                        <Trash3 size={22} color="crimson" />
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn p-0 border border-0"
                      title="Khôi phục"
                      onClick={() => handleActive(p)}
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

      <ProductViewModal
        open={openView}
        product={selectedProduct}
        onClose={closeView}
      />
      <ProductFilterModal
        open={openFilter}
        onClose={() => setOpenFilter(false)}
      />
      <InventoryModal
        open={openInventory}
        onClose={() => setOpenInventory(false)}
      />
    </>
  );
}
