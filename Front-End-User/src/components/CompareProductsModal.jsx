import React, { useState, useEffect } from "react";
import { useProductCompare } from '../context/ProductCompareContext';
import { FaTimes } from 'react-icons/fa';
import { IoIosArrowDown } from "react-icons/io";
import { IoMdSwap } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { AiOutlinePlus } from "react-icons/ai";


const CompareProductsModal = () => {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const savedState = localStorage.getItem("isCollapsed");
        return savedState ? JSON.parse(savedState) : true;
    });
    const navigate = useNavigate()
    const { isCompareVisible, compareListLength, setIsCompareVisible, compareList, removeFromCompare, clearCompareList } = useProductCompare();

    useEffect(() => {
        if (compareListLength > 0) {
            setIsCollapsed(false);
        }
    }, [compareListLength]);

    const handleCompare = () => {
        setIsCompareVisible(false)
        navigate("/compare", { state: { compare: compareList } });
    }

    if (!isCompareVisible) return null;

    return (
        <>
            <div className={`fixed bottom-0 left-0  ${isCollapsed ? "flex justify-start items-center" : "bg-white border-t  max-w-screen-xl mx-auto"} z-50  h-28 right-0  shadow-md  transition-all`}>
                {isCollapsed ? (
                    <div className="flex ml-2 justify-center items-center bg-white w-fit rounded-full shadow-gray-300 shadow-lg border-t-2 p-2">
                        <button
                            className="flex items-center font-semibold text-sm text-blue-600 hover:underline"
                            onClick={() => setIsCollapsed(false)}
                        >
                            <IoMdSwap className="mr-1 text-lg" />

                            <span>So sánh ({compareList.length})</span>

                        </button>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="flex justify-end mb-2 absolute -top-8 right-0 px-3 py-2 rounded-t-md border-2 bg-white z-50">
                            <button
                                onClick={() => setIsCollapsed(true)}
                                className="font-semibold flex items-center hover:underline"
                            >
                                <span>Thu gọn</span>
                                <IoIosArrowDown />
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {Array.from({ length: 3 }).map((_, index) => {
                                const product = compareList[index];
                                return (
                                    <div
                                        key={index}
                                        className="relative flex items-center justify-center w-full h-full border-x-2"
                                    >
                                        {product ? (
                                            <div className="flex flex-col p-1 gap-1">
                                                <div className="flex justify-center items-center">
                                                    <img
                                                        src={product.productImage[0] || "https://via.placeholder.com/150"}
                                                        alt={product.productName}
                                                        className="w-16 h-16 object-cover rounded-lg group-hover:opacity-70 transition"
                                                    />
                                                    <button
                                                        onClick={() => removeFromCompare(product._id)}
                                                        className="absolute top-1 right-1 text-gray-600 hover:text-red-400 text-lg px-1 rounded"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                                <p className="font-semibold text-sm text-center">{product.productName}</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="pointer-events-none font-semibold text-gray-400 border-2 border-dashed border-gray-400 rounded p-2 flex items-center justify-center">
                                                    <AiOutlinePlus className="h-7 w-7 text-gray-400" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-500">Thêm sản phẩm</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-gray-100 p-2">
                                <button
                                    onClick={compareListLength > 1 ? handleCompare : undefined}
                                    className={`w-fit px-6 py-4 text-sm font-semibold rounded ${compareListLength > 1
                                        ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                                        }`}
                                    disabled={compareListLength <= 1}
                                >
                                    So sánh ngay
                                </button>
                                <button
                                    onClick={clearCompareList}
                                    className="w-full text-blue-500 text-sm font-semibold py-1 rounded"
                                >
                                    Xóa tất cả
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CompareProductsModal;
