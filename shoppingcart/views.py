from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Product, Purchase
from .serializers import ProductSerializer, PurchaseSerializer, NestedPurchaseSerializer


def index(request):
    return render(request, 'shoppingcart/index.html')


def create_purchase(request):
    return render(request, 'shoppingcart/create_purchase.html')


def edit_purchase(request, pk):
    return render(request, 'shoppingcart/edit_purchase.html', {'pk': pk})


@api_view(['GET', 'POST'])
def product_list(request):
    if request.method == 'GET':
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    else:
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def purchase_list(request):
    if request.method == 'GET':
        nested = request.query_params.get('nested', False)
        purchases = Purchase.objects.all()
        if nested:
            serializer = NestedPurchaseSerializer(purchases, many=True)
        else:
            serializer = PurchaseSerializer(purchases, many=True)
        return Response(serializer.data)
    else:
        # print(request.data)
        serializer = PurchaseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def purchase_detail(request, pk):
    try:
        purchase = Purchase.objects.get(pk=pk)
    except Purchase.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = PurchaseSerializer(purchase)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = PurchaseSerializer(purchase, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        purchase.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
