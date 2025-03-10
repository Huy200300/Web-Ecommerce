import React, { createContext, useContext, useState } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";

const ProductCompareContext = createContext();

export const useProductCompare = () => useContext(ProductCompareContext);

export const ProductCompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);
  const [isCompareVisible, setIsCompareVisible] = useState(false);

  useEffect(() => {
    const storedCompareList = JSON?.parse(localStorage?.getItem("compareList"));
    if (storedCompareList) {
      setCompareList(storedCompareList);
    }
  }, []);

  useEffect(() => {
    localStorage?.setItem("compareList", JSON?.stringify(compareList));
  }, [compareList]);

  const addToCompare = (product) => {
    const existingProduct = compareList?.find(
      (item) => item?._id === product?._id
    );

    const compareListLength = compareList.length >= 3;
    const isSameCategory =
      compareList.length === 0 ||
      compareList[0]?.category === product?.category;

    if (!isSameCategory) {
      toast?.error("Sản phẩm phải cùng danh mục để so sánh!");
      setIsCompareVisible(true);
      return;
    }

    if (compareListLength) {
      toast?.error("Vui lòng xóa bớt sản phẩm để so sánh!");
      setIsCompareVisible(true);
    } else if (existingProduct) {
      toast?.error("Sản phẩm đã có trong sản phẩm so sánh");
      setIsCompareVisible(true);
    } else {
      const updatedCart = [...compareList, { ...product, amount: 1 }];
      setCompareList(updatedCart);
      localStorage?.setItem("compareList", JSON?.stringify(updatedCart));
      toast?.success("Sản phẩm đã được thêm vào sản phẩm so sánh");
      setIsCompareVisible(true);
    }
  };


  const removeFromCompare = (productId) => {
    const updatedFavorites = compareList?.filter(
      (item) => item?._id !== productId
    );
    setCompareList(updatedFavorites);
    localStorage?.setItem("compareList", JSON?.stringify(updatedFavorites));
    toast?.warning("Sản phẩm đã được xóa khỏi sản phẩm so sánh");
    if (compareList?.length === 1) {
      setIsCompareVisible(false);
    } else {
      setIsCompareVisible(true);
    }
  };

  const clearCompareList = () => {
    setCompareList([]);
    localStorage?.removeItem("compareList");
    toast?.success("Đã xóa tất cả sản phẩm khỏi danh sách so sánh");
    setIsCompareVisible(false);
  };

  return (
    <ProductCompareContext.Provider
      value={{
        compareList,
        compareListLength: compareList.length,
        addToCompare,
        removeFromCompare,
        clearCompareList,
        isCompareVisible,
        setIsCompareVisible,
      }}
    >
      {children}
    </ProductCompareContext.Provider>
  );
};
