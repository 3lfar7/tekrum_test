from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.index),
    url(r'^purchases/$', views.create_purchase),
    url(r'^purchases/(?P<pk>[0-9]+)/$', views.edit_purchase),
    url(r'^api/purchases/$', views.purchase_list),
    url(r'^api/purchases/(?P<pk>[0-9]+)/$', views.purchase_detail),
    url(r'^api/products/$', views.product_list),
]
