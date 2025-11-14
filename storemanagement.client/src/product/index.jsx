import axios from 'axios';
import { useState, useEffect } from 'react';
import { Eye, PencilSquare, PlusCircleFill } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

export default function ProductManagement() {
  const navTo = useNavigate();
  const [productList, setProductList] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const handleSearch = value => {
    setSearch(value);
    axios.get(`/api/product?name=${value}`).then(response => setProductList(response.data));
  }

  useEffect(() => {
    if (loading) {
      document.title = "Sản phẩm | Quản lý kho hàng";
      axios.get("/api/product").then(response => {
        setProductList(response.data);
        setLoading(false);
      })
    }
  }, []);

  return loading ? <></> : (
    <>
      <h1 className='text-center text-uppercase mb-3 fs-2'>Quản lý sản phẩm</h1>

      <div className='d-flex column-gap-3 mb-3'>
        <button className='btn btn-success' onClick={() => navTo('/product/add')}>
          <PlusCircleFill className="me-1" /> Thêm sản phẩm mới
        </button>

        <form className='col'>
          <input
            type="search" placeholder="Nhập tên sản phẩm cần tìm"
            className='form-control'
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </form>
      </div>

      <table className='table table-striped table-hover table-bordered'>
        <thead>
          <tr className='text-center'>
            <th>ID</th>
            <th>Tên sản phẩm</th>
            <th>Loại sản phẩm</th>
            <th>Nhà cung cấp</th>
            <th>Barcode</th>
            <th>Giá</th>
            <th>Đơn vị</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
        {
          (productList.length === 0) ? (
            <tr>
              <td colSpan={8} className='text-center fst-italic'>Không có sản phẩm!</td>
            </tr>
          ) : productList.map(s =>
            <tr key={`product-${s.productId}`}>
              <td>{s.productId}</td>
              <td className='text-center'>{s.productName}</td>
              <td className='text-center'>{s.category.categoryName}</td>
              <td className='text-center'>{s.supplier.name}</td>
              <td className='text-center'>{s.barcode}</td>
              <td className='text-center'>{s.price.toLocaleString('vi-VN')}</td>
              <td className='text-center'>{s.unit}</td>
              <td className='text-center'>
                <button className='btn p-0 me-1' onClick={() => navTo(`/product/edit/${s.productId}`)}>
                  <PencilSquare size={24} />
                </button>
                <button className='btn p-0'>
                  <Eye size={24} />
                </button>
              </td>
            </tr>
          )
        }
        </tbody>
      </table>
    </>
  )
}