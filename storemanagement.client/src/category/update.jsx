import axios from 'axios';
import { useState, useEffect } from 'react';
import { FloppyFill, XLg } from 'react-bootstrap-icons';
import { useParams, useNavigate } from 'react-router-dom';

export default function UpdateCategory() {
  const navTo = useNavigate();
  const { id } = useParams();
  const [category, setCategory] = useState({categoryId: id, categoryName: ""})
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      document.title = "Cập nhật loại sản phẩm | Quản lý kho hàng";
      axios.get(`/api/category/${id}`).then(response => {
        setCategory(response.data);
        setLoading(false);
      })
    }
  }, []);

  return loading ? <></> : (
    <>
      <h1 className='text-center text-uppercase mb-3 fs-2'>Cập nhật loại sản phẩm</h1>

      <form onSubmit={e => e.preventDefault()}>
        <div>
          <label htmlFor="category-id" className='d-block mb-1'>ID:</label>
          <input
            className='form-control mb-4'
            type="text" id="category-id" value={id} readOnly
          />
        </div>
        
        <div>
          <label htmlFor="category-name" className='d-block mb-1'>Tên loại sản phẩm:</label>
          <input
            className='form-control mb-4'
            placeholder='Nhập tên loại sản phẩm'
            type="text" id="category-name" value={category.categoryName}
            onChange={e => setCategory({...category, categoryName: e.target.value})}
          />
        </div>

        <div className='d-flex justify-content-center column-gap-2'>
          <button type="submit" onClick={() => handleSubmit()} className='btn btn-success'>
            <FloppyFill size={20} className='me-1' /> Cập nhật
          </button>

          <button onClick={() => navTo("/category", { replace: true })}  className='btn btn-secondary'>
            <XLg size={20} className='me-1' /> Hủy bỏ
          </button>
        </div>
      </form>
    </>
  )

  function handleSubmit() {
    axios.put(`/api/category/${id}`, category, {
      "headers": { 'Content-Type': 'application/json' }
    }).then(response => {
      if (response.status === 200) {
        alert("Cập nhật thành công!")
        navTo("/category", { replace: true })
      }
      else {
        alert("Cập nhật thất bại!");
        console.error(response);
      }
    }).catch(err => {
      alert("Cập nhật thất bại!");
      console.error(err);
    })
  }
}