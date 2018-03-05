from django.db import models


class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)


class Purchase(models.Model):
    date = models.DateTimeField(auto_now=True)
    products = models.ManyToManyField(Product)

    @property
    def price(self):
        return self.products.aggregate(models.Sum('price'))['price__sum']

    class Meta:
        ordering = ['-date']
