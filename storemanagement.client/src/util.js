const backendUrl = "https://localhost:7064";

function toVNNumber(number) {
  return Number(number).toLocaleString("vi-VN");
}

function toVNPrice(number) {
  return Number(number).toLocaleString("vi-VN") + " đ";
}

function toVNDate(date) {
  return date ? new Date(date).toLocaleDateString("fr-FR") : "";
}

function toVNDateTime(date) {
  return date ? new Date(date).toLocaleString("vi-VN") : "";
}

function splitPhoneNumber(phoneNumber) {
  const first = phoneNumber.substring(0,4);
  const second = phoneNumber.substring(4,7);
  const third = phoneNumber.substring(7);

  return first + " " + second + " " + third;
}

export { backendUrl, toVNNumber, toVNPrice, toVNDate, toVNDateTime, splitPhoneNumber }