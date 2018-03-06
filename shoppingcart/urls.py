from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.index, name="index"),
    url(r'^purchases/$', views.create_purchase, name='create-purchase'),
    url(r'^purchases/(?P<pk>[0-9]+)/$', views.edit_purchase, name='edit-purchase'),
    url(r'^api/purchases/$', views.purchase_list, name='purchase-list'),
    url(r'^api/purchases/(?P<pk>[0-9]+)/$', views.purchase_detail, name='purchase-detail'),
    url(r'^api/products/$', views.product_list, name='product-list'),
]
