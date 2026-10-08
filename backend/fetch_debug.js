fetch('http://localhost:5000/api/bookings/fix-dangling')
  .then(res => res.text())
  .then(text => console.log(text))
  .catch(err => console.error(err));
