import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import specificationsByCategory from "../helpers/specificationsByCategory";

const SpecificationsSection = ({ compareList, category }) => {
    const [expanded, setExpanded] = useState({});

    const toggleExpand = (key) => {
        setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const categorySpecs = specificationsByCategory[category] || {};

    return (
        <div className="mt-4">
            {Object.entries(categorySpecs).map(([key, label]) => (
                <div key={key} className="mt-4">
                    {/* Header cho từng thông số */}
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg mb-2">{label}</h2>
                        <button
                            onClick={() => toggleExpand(key)}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            {expanded[key] ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                    </div>

                    {/* Nội dung từng thông số */}
                    {expanded[key] && (
                        <div className="grid grid-cols-4 gap-4 border-b pb-4">
                            {Object.keys(specificationsByCategory.mobiles).map((key) => (
                                <React.Fragment key={key}>
                                    <div className="font-bold">{specificationsByCategory.mobiles[key]}</div>
                                    {Object.values(compareList).map((product, index) => (
                                        <div key={index} className="text-center">
                                            {product[key] || "-"}
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default SpecificationsSection;
