import axios from 'axios';
import { useState, useEffect } from 'react';
import { FloppyFill, XLg } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

export default function AddCategory() {
  const navTo = useNavigate();
  const [category, setCategory] = useState({categoryId: 0, categoryName: ""})

  useEffect(() => {
    document.title = "Thêm loại sản phẩm | Quản lý kho hàng";
  }, [])

  return (
    <>
      <h1 className='text-center text-uppercase mb-3 fs-2'>Thêm loại sản phẩm mới</h1>

      <form onSubmit={e => e.preventDefault()}>
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
          <button type="submit" onClick={handleSubmit} className='btn btn-success'>
            <FloppyFill size={20} className='me-1' /> Thêm
          </button>

          <button onClick={() => navTo("/category", { replace: true })}  className='btn btn-secondary'>
            <XLg size={20} className='me-1' /> Hủy bỏ
          </button>
        </div>
      </form>
    </>
  )

  function handleSubmit() {
    axios.post(`/api/category`, category, {
      "headers": { 'Content-Type': 'application/json' }
    }).then(response => {
      if (response.status === 201) {
        alert("Thêm thành công!")
        navTo("/category", { replace: true })
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