import axios from "axios";
import { useEffect, useState } from "react";
import { FloppyFill, XLg } from "react-bootstrap-icons";
import { useNavigate, useParams } from "react-router-dom";

export default function AddUpProduct({ status = false }) {
  const navTo = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [product, setProduct] = useState({
    productId: 0,
    productName: "",
    categoryId: -1,
    supplierId: -1,
    barcode: "",
    price: "",
    unit: "",
  });

  const [categoryList, setCategoryList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);

  const [errors, setErrors] = useState({
    productName: "",
    categoryId: "",
    supplierId: "",
    barcode: "",
    price: "",
    unit: "",
  });

  useEffect(() => {
    document.title = `${
      status ? "Cập nhật" : "Thêm"
    } sản phẩm | Quản lý kho hàng`;
    if (status && id) {
      fetchData(id);
    } else {
      setLoading(false);
    }
  }, [status, id]);

  async function fetchData(id) {
    try {
      //   const { data } = await axios.get(`/api/product/${id}`);
      //   setProduct({
      //     productId: data.productId ?? Number(id),
      //     productName: data.productName ?? "",
      //     categoryId: data.categoryId ?? -1,
      //     supplierId: data.supplierId ?? -1,
      //     barcode: data.barcode ?? "",
      //     price: data.price ?? "",
      //     unit: data.unit ?? "",
      //   });
      const data = {
        productId: Number(id),
        productName: "Coca Cola lon 330ml",
        categoryId: 1,
        supplierId: 2,
        barcode: "8931234567890",
        price: 12000,
        unit: "lon",
      };
      setProduct({
        productId: data.productId ?? Number(id),
        productName: data.productName ?? "",
        categoryId: data.categoryId ?? -1,
        supplierId: data.supplierId ?? -1,
        barcode: data.barcode ?? "",
        price: data.price ?? "",
        unit: data.unit ?? "",
      });
    } catch (e) {
      console.error(e);
      alert("Không tải được dữ liệu khách hàng.");
    } finally {
      setLoading(false);
    }
  }

  const setField = (key) => (e) => {
    let val = e.target.value;
    if (key === "categoryId" || key === "supplierId") val = Number(val);
    setProduct((p) => ({ ...p, [key]: val }));
  };

  const validateField = (key, val) => {
    let msg = "";

    if (key === "productName") {
      if (!val.trim()) msg = "Vui lòng nhập tên sản phẩm.";
      else if (val.trim().length < 2) msg = "Tên tối thiểu 2 ký tự.";
    }

    if (key === "categoryId") {
      if (Number(val) < 0) msg = "Vui lòng chọn loại sản phẩm.";
    }

    if (key === "supplierId") {
      if (Number(val) < 0) msg = "Vui lòng chọn nhà cung cấp.";
    }

    if (key === "barcode") {
      if (!val.trim()) msg = "Vui lòng nhập barcode.";
      else if (!/^[0-9]{6,20}$/.test(val.trim()))
        msg = "Barcode chỉ chứa số (6–20 ký tự).";
    }

    if (key === "price") {
      const n = Number(String(val).replaceAll(",", ""));
      if (!Number.isFinite(n) || n <= 0) msg = "Giá phải là số > 0.";
    }

    if (key === "unit") {
      if (!val.trim()) msg = "Vui lòng nhập đơn vị tính.";
    }

    setErrors((e) => ({ ...e, [key]: msg }));
    return msg;
  };

  const handleBlur = (key) => (e) => {
    validateField(key, e.target.value);
  };

  const validateAll = () => {
    const m = {
      productName: validateField("productName", product.productName),
      categoryId: validateField("categoryId", product.categoryId),
      supplierId: validateField("supplierId", product.supplierId),
      barcode: validateField("barcode", product.barcode),
      price: validateField("price", product.price),
      unit: validateField("unit", product.unit),
    };
    return Object.values(m).every((x) => !x);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    alert(
      (status ? "Cập nhật -----" + id : "Thêm -----") +
        JSON.stringify(product, null, 2)
    );

    // try {
    //   setSubmitting(true);

    //   const payload = {
    //     productName: product.productName.trim(),
    //     categoryId: Number(product.categoryId),
    //     supplierId: Number(product.supplierId),
    //     barcode: product.barcode.trim(),
    //     price: Number(String(product.price).replaceAll(",", "")),
    //     unit: product.unit.trim() || "pcs",
    //   };

    //   let res;
    //   if (status) {
    //     res = await axios.put(`/api/product/${id}`, payload, {
    //       headers: { "Content-Type": "application/json" },
    //     });
    //   } else {
    //     res = await axios.post(`/api/product`, payload, {
    //       headers: { "Content-Type": "application/json" },
    //     });
    //   }

    //   if (res.status === 200 || res.status === 201) {
    //     alert(`${status ? "Cập nhật" : "Thêm"} sản phẩm thành công!`);
    //     navTo("/admin/product", { replace: true });
    //   } else {
    //     console.error(res);
    //     alert(`${status ? "Cập nhật" : "Thêm"} thất bại!`);
    //   }
    // } catch (err) {
    //   console.error(err);
    //   alert(`${status ? "Cập nhật" : "Thêm"} thất bại!`);
    // } finally {
    //   setSubmitting(false);
    // }
  };

  if (loading) return null;

  return (
    <>
      <h1 className="text-center text-uppercase mb-3 fs-2">
        {status ? "Cập nhật" : "Thêm"} sản phẩm
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="product-name" className="d-block mb-1">
            Tên sản phẩm:
          </label>
          <input
            id="product-name"
            className={`form-control ${
              errors.productName ? "is-invalid" : ""
            } mb-1`}
            placeholder="Nhập tên sản phẩm"
            type="text"
            value={product.productName}
            onChange={setField("productName")}
            onBlur={handleBlur("productName")}
          />
          {errors.productName && (
            <small className="text-danger">{errors.productName}</small>
          )}
        </div>

        <div className="mt-3">
          <label htmlFor="product-category" className="d-block mb-1">
            Loại sản phẩm:
          </label>
          <select
            id="product-category"
            className={`form-control ${
              errors.categoryId ? "is-invalid" : ""
            } mb-1`}
            value={product.categoryId}
            onChange={setField("categoryId")}
            onBlur={handleBlur("categoryId")}
          >
            <option value={-1} hidden>
              Chọn loại sản phẩm
            </option>
            {categoryList.map((c) => (
              <option value={c.categoryId} key={`category-${c.categoryId}`}>
                {c.categoryName}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <small className="text-danger">{errors.categoryId}</small>
          )}
        </div>

        <div className="mt-3">
          <label htmlFor="product-supplier" className="d-block mb-1">
            Nhà cung cấp:
          </label>
          <select
            id="product-supplier"
            className={`form-control ${
              errors.supplierId ? "is-invalid" : ""
            } mb-1`}
            value={product.supplierId}
            onChange={setField("supplierId")}
            onBlur={handleBlur("supplierId")}
          >
            <option value={-1} hidden>
              Chọn nhà cung cấp
            </option>
            {supplierList.map((s) => (
              <option value={s.supplierId} key={`supplier-${s.supplierId}`}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.supplierId && (
            <small className="text-danger">{errors.supplierId}</small>
          )}
        </div>

        <div className="mt-3">
          <label htmlFor="product-barcode" className="d-block mb-1">
            Barcode:
          </label>
          <input
            id="product-barcode"
            className={`form-control ${
              errors.barcode ? "is-invalid" : ""
            } mb-1`}
            placeholder="Nhập barcode (chỉ số, 6–20 ký tự)"
            type="text"
            value={product.barcode}
            onChange={setField("barcode")}
            onBlur={handleBlur("barcode")}
          />
          {errors.barcode && (
            <small className="text-danger">{errors.barcode}</small>
          )}
        </div>

        <div className="mt-3">
          <label htmlFor="product-price" className="d-block mb-1">
            Giá sản phẩm:
          </label>
          <input
            id="product-price"
            className={`form-control ${errors.price ? "is-invalid" : ""} mb-1`}
            placeholder="Nhập giá (VND)"
            type="number"
            min="0"
            step="1000"
            value={product.price}
            onChange={setField("price")}
            onBlur={handleBlur("price")}
          />
          {errors.price && (
            <small className="text-danger">{errors.price}</small>
          )}
        </div>

        <div className="mt-3">
          <label htmlFor="product-unit" className="d-block mb-1">
            Đơn vị tính:
          </label>
          <input
            id="product-unit"
            className={`form-control ${errors.unit ? "is-invalid" : ""} mb-1`}
            placeholder='Nhập đơn vị tính (vd: "hộp", "chai", "pcs"...)'
            type="text"
            value={product.unit}
            onChange={setField("unit")}
            onBlur={handleBlur("unit")}
          />
          {errors.unit && <small className="text-danger">{errors.unit}</small>}
        </div>

        <div className="d-flex justify-content-center column-gap-2 mt-4">
          <button
            type="submit"
            className="btn btn-success"
            disabled={submitting}
          >
            <FloppyFill size={20} className="me-1" />{" "}
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>

          <button
            type="button"
            onClick={() => navTo("/admin/product", { replace: true })}
            className="btn btn-secondary"
          >
            <XLg size={20} className="me-1" /> Hủy bỏ
          </button>
        </div>
      </form>
    </>
  );
}
