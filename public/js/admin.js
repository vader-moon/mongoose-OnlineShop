const deleteProduct = (btn) => {
  const productId = btn.parentNode.querySelector('[name=productId]').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
  const product = btn.closest('article');

  fetch(`/admin/product/${productId}`, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf
    }
  })
  .then(response => {
    return response.json();
  })
  .then(data => {
    console.log(data);
    product.parentNode.removeChild(product);
  })
  .catch(err => console.log(err));
}