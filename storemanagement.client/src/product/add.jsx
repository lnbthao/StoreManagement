import axios from 'axios';
import { useState, useEffect } from 'react';
import { FloppyFill, XLg } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

export default function AddProduct() {
  const navTo = useNavigate();
  const [product, setProduct] = useState({ productId: 0, productName: "", categoryId: -1, supplierId: -1, barcode: "", price: "", unit: "" });
  const [categoryList, setCategoryList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Thêm sản phẩm | Quản lý kho hàng";
    fetchData();
  }, [])

  return (
    <>
      <h1 className='text-center text-uppercase mb-3 fs-2'>Thêm sản phẩm mới</h1>

      <form onSubmit={e => e.preventDefault()}>
        <div>
          <label htmlFor="product-name" className='d-block mb-1'>Tên sản phẩm:</label>
          <input
            className='form-control mb-4'
            placeholder='Nhập tên sản phẩm'
            type="text" id="product-name" value={product.productName}
            onChange={e => setProduct({...product, productName: e.target.value})}
          />
        </div>

        <div>
          <label htmlFor="product-category" className='d-block mb-1'>Loại sản phẩm:</label>
          <select
            id="product-category" className='form-control mb-4'
            value={product.categoryId} onChange={e => setProduct({...product, categoryId: e.target.value})}
          >
            <option value={-1} hidden>Chọn loại sản phẩm</option>
            {
              categoryList.map(c => <option value={c.categoryId} key={`category-${c.categoryId}`}>{c.categoryName}</option>)
            }
          </select>
        </div>

        <div>
          <label htmlFor="product-supplier" className='d-block mb-1'>Nhà cung cấp:</label>
          <select
            id="product-supplier" className='form-control mb-4'
            value={product.supplierId} onChange={e => setProduct({...product, supplierId: e.target.value})}
          >
            <option value={-1} hidden>Chọn nhà cung cấp</option>
            {
              supplierList.map(s => <option value={s.supplierId} key={`category-${s.supplierId}`}>{s.name}</option>)
            }
          </select>
        </div>
        
        <div>
          <label htmlFor="product-barcode" className='d-block mb-1'>Barcode:</label>
          <input
            className='form-control mb-4'
            placeholder='Nhập barcode'
            type="text" id="product-barcode" value={product.barcode}
            onChange={e => setProduct({...product, barcode: e.target.value})}
          />
        </div>
        
        <div>
          <label htmlFor="product-price" className='d-block mb-1'>Giá sản phẩm:</label>
          <input
            className='form-control mb-4'
            placeholder='Nhập giá sản phẩm'
            type="text" id="product-price" value={product.price}
            onChange={e => setProduct({...product, price: e.target.value})}
          />
        </div>
        
        <div>
          <label htmlFor="product-unit" className='d-block mb-1'>Đơn vị tính:</label>
          <input
            className='form-control mb-4'
            placeholder='Nhập đơn vị tính'
            type="text" id="product-unit" value={product.unit}
            onChange={e => setProduct({...product, unit: e.target.value})}
          />
        </div>

        <div className='d-flex justify-content-center column-gap-2'>
          <button type="submit" className='btn btn-success' onClick={() => handleSubmit()}>
            <FloppyFill size={20} className='me-1' /> Thêm
          </button>

          <button onClick={() => navTo("/product", { replace: true })}  className='btn btn-secondary'>
            <XLg size={20} className='me-1' /> Hủy bỏ
          </button>
        </div>
      </form>
    </>
  )

  async function fetchData() {    
    if (loading) {
      const categoryResponse = await axios.get("/api/category");
      const categoryData = await categoryResponse.data;
      setCategoryList(categoryData);

      const supplierResponse = await axios.get("/api/supplier");
      const supplierData = await supplierResponse.data;
      setSupplierList(supplierData);
      setLoading(false);
    }
  }

  function handleSubmit() {
    if (!product.unit) product.unit = "pcs";

    axios.post(`/api/product`, product, {
      "headers": { 'Content-Type': 'application/json' }
    }).then(response => {
      if (response.status === 201) {
        alert("Thêm thành công!")
        navTo("/product", { replace: true })
      }
      else {
        alert("Thêm thất bại!");
        console.error(response);
      }
    }).catch(err => {
      alert("Thêm thất bại!");
      console.error(err);
    })
  }
}