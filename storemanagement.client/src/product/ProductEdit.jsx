import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MOCK_PRODUCTS } from "../../mockData/Products";

export default function ProductEdit() {
  const { id } = useParams();
  const navTo = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = MOCK_PRODUCTS.find((p) => p.productId === Number(id));
    if (found) {
      setProduct({ ...found });
      setLoading(false);
    } else {
      navTo("/admin/product");
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Đã lưu sản phẩm (demo)!");
    navTo("/admin/product");
  };

  if (loading) return <div className="text-center py-5">Đang tải...</div>;
  if (!product) return <div className="alert alert-danger">Không tìm thấy sản phẩm!</div>;

  return (
    <>
      <h1 className="text-center mb-4">Chỉnh sửa sản phẩm</h1>
      <form onSubmit={handleSubmit} className="col-md-8 mx-auto">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Tên sản phẩm</label>
            <input
              type="text"
              className="form-control"
              value={product.productName}
              onChange={(e) => setProduct({ ...product, productName: e.target.value })}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Barcode</label>
            <input
              type="text"
              className="form-control"
              value={product.barcode}
              onChange={(e) => setProduct({ ...product, barcode: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Giá bán</label>
            <input
              type="number"
              className="form-control"
              value={product.price}
              onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
              min="0"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Đơn vị</label>
            <input
              type="text"
              className="form-control"
              value={product.unit}
              onChange={(e) => setProduct({ ...product, unit: e.target.value })}
            />
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-primary me-2">
              Lưu thay đổi
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navTo("/admin/product")}>
              Hủy
            </button>
          </div>
        </div>
      </form>
    </>
  );
}