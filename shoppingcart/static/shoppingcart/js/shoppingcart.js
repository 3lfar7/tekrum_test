function ajax(url, method, data, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  xhr.onreadystatechange = function () {
    if (this.readyState != 4) return;
    callback(this.status, this.responseText);
  }
  if (data) {
    xhr.send(JSON.stringify(data));
  } else {
    xhr.send();
  }
}

function createShop(el, productListUrl, purchaseListUrl, purchaseDetailUrl) {
  return new Vue({
    el: el,
    data: {
      purchaseDetailUrl: purchaseDetailUrl,
      // pk: pk === undefined ? null : pk,
      products: {},
      message: {
        title: '',
        bad: false
      },
      priceSum: 0
    },
    methods: {
      toggleProduct: function (id) {
        var product = this.products[id];
        product.inCart = !product.inCart;
        var priceSum = this.priceSum;
        if (product.inCart) {
          priceSum += parseFloat(product.price);
        } else {
          priceSum -= parseFloat(product.price);
        }
        this.priceSum = Math.round(priceSum * 100) / 100;
      },
      createPurchase: function () {
        var self = this;
        var data = {
          products: this.getCartProducts()
        }
        ajax(purchaseListUrl, 'POST', data, function (status, responseText) {
          if (status == 201) {
            var purchase = JSON.parse(responseText);
            // console.log(responseText);
            self.message.title = 'Покупка (pk=' + purchase.id + ') успешно создана';
            self.message.bad = false;
          } else if (status == 400) {
            self.message.title = 'Корзина не может быть пустой';
            self.message.bad = true;
          }
        });
      },
      updatePurchase: function () {
        var self = this;
        data = {products: this.getCartProducts()};
        ajax(purchaseDetailUrl, 'PUT', data, function (status, responseText) {
          if (status == 200) {
            self.message.title = 'Покупка успешно обновлена';
            self.message.bad = false;
          } else if (status == 400) {
            self.message.title = 'Корзина не может быть пустой';
            self.message.bad = true;
          }
        });
      },
      getCartProducts: function () {
        var cartProducts = [];
        for (var pk in this.products) {
          var product = this.products[pk];
          if (product.inCart) {
            cartProducts.push(product.id);
          }
        }
        return cartProducts;
      },
      fetchProducts: function () {
        var self = this;
        var tempProducts = {};
        ajax(productListUrl, 'GET', null, function (status, responseText) {
          var products = JSON.parse(responseText);
          products.forEach(function (product) {
            product.inCart = false;
            tempProducts[product.id] = product;
          });
          if (self.purchaseDetailUrl) {
            self.fetchPurchase(tempProducts);
          } else {
            self.products = tempProducts;
          }
        });
      },
      fetchPurchase: function (tempProducts) {
        var self = this;
        ajax(purchaseDetailUrl, 'GET', null, function (status, responseText) {
          var purchase = JSON.parse(responseText);
          var priceSum = 0;
          purchase.products.forEach(function (productId) {
            tempProducts[productId].inCart = true;
            priceSum += parseFloat(tempProducts[productId].price);
          });
          self.priceSum = Math.round(priceSum * 100) / 100;
          self.products = tempProducts;
        });
      },
      closeMessage: function () {
        this.message.title = '';
      }
    },
    created: function () {
      this.fetchProducts();
    }
  });
}

function createPurchaseList(el, url) {
  return new Vue({
    el: el,
    data: {
      purchases: []
    },
    methods: {
      fetchPurchases: function () {
        var self = this;
        ajax(url + '?nested=true', 'GET', null, function (status, responseText) {
          // console.log(responseText);
          self.purchases = JSON.parse(responseText);
        });
      },
      editPurchase: function (index) {
        window.location = this.purchases[index].edit_url;
      },
      deletePurchase: function (index) {
        var self = this;
        ajax(this.purchases[index].url, 'DELETE', null, function (status, responseText) {
          self.purchases.splice(index, 1);
        });
      },
      formatDate: function (date) {
        date = new Date(date);
        var day = date.getDate();
        var month = date.getMonth();
        var year = date.getFullYear();
        var hours = date.getHours();
        var minutes = date.getMinutes();

        function format(value, length) {
          length = length == undefined ? 2 : length;
          value = value.toString();
          if (value.length > length) {
            value = value.slice(length);
          } else if (value.length < length) {
            for (var i = 0; i < length - value.length; i++) {
              value = '0' + value;
            }
          }
          return value;
        }

        return format(day) + '.' + format(month) + '.' + format(year) + ' ' + format(hours) + ':' + format(minutes);
      }
    },
    created: function () {
      this.fetchPurchases();
    }
  });
}
