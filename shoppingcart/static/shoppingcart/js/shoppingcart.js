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

function createShop(el, pk) {
  return new Vue({
    el: el,
    data: {
      pk: pk === undefined ? null : pk,
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
        if (product.inCart) {
          this.priceSum += parseFloat(product.price);
        } else {
          this.priceSum -= parseFloat(product.price);
        }
      },
      createPurchase: function () {
        var self = this;
        var data = {
          products: this.getCartProducts()
        }
        ajax('/api/purchases/', 'POST', data, function (status, responseText) {
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
        ajax('/api/purchases/' + this.pk + '/', 'PUT', data, function (status, responseText) {
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
        ajax('/api/products/', 'GET', null, function (status, responseText) {
          var products = JSON.parse(responseText);
          products.forEach(function (product) {
            product.inCart = false;
            self.$set(self.products, product.id, product);
          });
          if (self.pk !== null) {
            self.fetchPurchase();
          }
        });
      },
      fetchPurchase: function () {
        var self = this;
        ajax('/api/purchases/' + this.pk + '/', 'GET', null, function (status, responseText) {
          var purchase = JSON.parse(responseText);
          purchase.products.forEach(function (productId) {
            self.$set(self.products[productId], 'inCart', true);
            self.priceSum += parseFloat(self.products[productId].price);
          });
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

function createPurchaseList(el) {
  return new Vue({
    el: el,
    data: {
      purchases: []
    },
    methods: {
      fetchPurchases: function () {
        var self = this;
        ajax('/api/purchases/?nested=true', 'GET', null, function (status, responseText) {
          self.purchases = JSON.parse(responseText);
          self.purchases.forEach(function (purchase) {

            console.log(typeof(purchase.date));
          });
        });
      },
      editPurchase: function (index) {
        window.location = '/purchases/' + this.purchases[index].id + '/';
      },
      deletePurchase: function (index) {
        var self = this;
        ajax('/api/purchases/' + this.purchases[index].id + '/', 'DELETE', null, function (status, responseText) {
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
