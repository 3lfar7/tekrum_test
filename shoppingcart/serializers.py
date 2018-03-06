from django.urls import reverse
from rest_framework import serializers
from .models import Product, Purchase


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ('id', 'name', 'price')


class PurchaseSerializer(serializers.ModelSerializer):
    def validate_products(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError("Purchase may contain one type of product")
        return value

    class Meta:
        model = Purchase
        fields = ('id', 'date', 'products')


class NestedPurchaseSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True)
    url = serializers.SerializerMethodField()
    edit_url = serializers.SerializerMethodField()

    def get_url(self, obj):
        return reverse('purchase-detail', kwargs={'pk': obj.pk})

    def get_edit_url(self, obj):
        return reverse('edit-purchase', kwargs={'pk': obj.pk})

    class Meta:
        model = Purchase
        fields = ('id', 'date', 'products', 'price', 'url', 'edit_url')
