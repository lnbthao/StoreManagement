import axios from "axios";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const navTo = useNavigate();
  const [productList, setProductList] = useState([]);
  const [purchaseList, setPurchaseList] = useState([]);
  //const [loading, setLoading] = useState(true);

  useEffect(() => {
    //if (loading) {
      //axios.get("/api/product").then(response => setProductList(productList));
      document.title = "Trang thanh toán"
    //}
  }, [])

  return (
    <h1>
      Trang thanh toán
    </h1>
  )

  async function handleCheckout() {
    
  }
  
  function handleLogout() {
    // TODO: Copy code từ bên admin

    navTo("/");
  }
}