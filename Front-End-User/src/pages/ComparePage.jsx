import React, { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import SummaryAip from '../common';
import specificationsByCategory from '../helpers/specificationsByCategory';

const ProductComparison = () => {
    const location = useLocation();
    const compareList = location.state?.compare || [];
    const [dataSpec, setDataSpec] = useState([]);
    const [showDifferencesOnly, setShowDifferencesOnly] = useState(false); // Checkbox state
    const [isQuickCompareOpen, setIsQuickCompareOpen] = useState({}); 

    const fetchProductSpec = async (id) => {
        try {
            const res = await fetch(`${SummaryAip.specifications_by_id.url}/${id}`, {
                method: SummaryAip.specifications_by_id.method,
                credentials: "include",
            });
            const dataApi = await res.json();
            setDataSpec(prevData => [...prevData, { id, data: dataApi.data }]);
        } catch (error) {
            console.error("Error fetching product specifications:", error);
        }
    };

    useEffect(() => {
        compareList.forEach(product => {
            fetchProductSpec(product._id);
        });
    }, [compareList]);

    const toggleSection = (section) => {
        setIsQuickCompareOpen((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    // Lấy thông số kỹ thuật theo category của sản phẩm
    const renderQuickCompare = (sectionKey, sectionTitle, keyMapping) => (
        <div className="mb-6">
            <div
                className="flex justify-between items-center cursor-pointer border-b pb-2 mb-4 text-gray-700 hover:text-indigo-600"
                onClick={() => toggleSection(sectionKey)}
            >
                <h2 className="text-lg font-semibold">{sectionTitle}</h2>
                {isQuickCompareOpen[sectionKey] ? (
                    <FaChevronUp className="text-gray-500" />
                ) : (
                    <FaChevronDown className="text-gray-500" />
                )}
            </div>
            {isQuickCompareOpen[sectionKey] && (
                <table className="w-full border-collapse border border-gray-200 text-center">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border border-gray-200 px-4 py-2">Sản phẩm</th>
                            {compareList.map((product, index) => (
                                <th key={index} className="border border-gray-200 px-4 py-2">
                                    {product.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-gray-200 px-4 py-2 font-semibold">
                                {sectionTitle}
                            </td>
                            {compareList.map((product, index) => {
                                const productSpec = dataSpec.find(
                                    (spec) => spec.id === product._id
                                );
                                return (
                                    <td
                                        key={index}
                                        className="border border-gray-200 px-4 py-2 text-gray-600"
                                    >
                                        {productSpec?.data.specificationsRef?.[keyMapping] || "Chưa có thông tin"}
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            )}
        </div>
    );

    return (
        <div className="max-w-screen-xl mx-auto p-6 bg-gray-50 rounded-lg">
            <div className='flex relative items-center gap-5 pb-6 mb-8'>
                <h1 className="text-2xl font-bold uppercase w-36">So sánh sản phẩm</h1>
                <span className='font-medium'>
                    <Link to="/" className='hover:text-red-500 capitalize cursor-pointer'>Trang chủ</Link> / So Sánh Sản Phẩm
                </span>
                <div className='absolute bottom-0 left-1/2 -ml-[50vw] right-1/2 -mr-[50vw] h-0.5 bg-slate-200 z-10'></div>
            </div>

            {/* HEADER */}
            <div className="flex shadow-md">
                {/* Cột tiêu đề và bộ lọc */}
                <div className="flex flex-col items-center justify-start w-1/5 p-4 border-r border-gray-200 bg-gray-50">
                    <div className="text-lg font-bold mb-4 text-gray-700">
                        {compareList.map((product, index) => (
                            <div key={index} className="mb-2">
                                <span>{product.name}</span>
                                {index < compareList.length - 1 && (
                                    <span className="text-gray-500 font-light"> & </span>
                                )}
                            </div>
                        ))}
                    </div>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={showDifferencesOnly}
                            onChange={() => setShowDifferencesOnly(!showDifferencesOnly)}
                            className="w-4 h-4 accent-indigo-600"
                        />
                        <span className="text-sm text-gray-600">Chỉ xem điểm khác biệt</span>
                    </label>
                </div>

                {/* Các cột sản phẩm */}
                <div className="grid grid-cols-3 w-4/5 gap-4">
                    {compareList.map((product, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 p-4 flex flex-col items-center bg-white shadow-sm hover:shadow-lg transition-shadow duration-200"
                        >
                            {/* Hình ảnh sản phẩm */}
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-24 w-24 mb-2 object-cover rounded-md"
                            />
                            {/* Tên sản phẩm */}
                            <h2 className="text-md font-semibold mb-1 text-gray-700">
                                {product.name}
                            </h2>
                            {/* Giá sản phẩm */}
                            <p className="text-red-500 font-bold">{product.price}</p>
                            <p className="line-through text-gray-500 text-sm">
                                {product.oldPrice}
                            </p>
                        </div>
                    ))}
                </div>
            </div>


            {/* SO SÁNH NHANH */}
            <div className="mt-8">
                {renderQuickCompare("screenSize", "Kích thước màn hình", "screenSize")}
                {renderQuickCompare("resolution", "Độ phân giải", "resolution")}
            </div>
        </div>
    );
};

export default ProductComparison;
