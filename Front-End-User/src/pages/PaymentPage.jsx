import React, { useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Context from '../context';
import SummaryAip from '../common';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAddressSelection from '../helpers/useAddressSelection';
import GenericModal from '../components/GenericModal';
import { useSelector } from 'react-redux';
import TermsModal from '../components/TermsModal';
import { useSelectedProducts } from '../context/SelectedProducts';
import PaymentSummary from '../components/PaymentSummary';
import PaymentProducts from '../components/PaymentProducts';
import PaymentAddress from '../components/PaymentAddress';
import { IoIosArrowDroprightCircle } from 'react-icons/io';
import UpdateInfoModal from '../components/UpdateInfoModal';
import ShippingMethod from '../components/ShippingMethod';

const PaymentPage = () => {
    const { dataUser, fetchUserDetails } = useContext(Context);
    const user = useSelector(state => state?.user?.user);
    const navigate = useNavigate();
    const location = useLocation();
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentType, setPaymentType] = useState('');
    const [shippingMethod, setShippingMethod] = useState('FAST');
    const [isOpenModalUpdateInfo, setIsOpenModalUpdateInfo] = useState(false);
    const [shippingFee, setShippingFee] = useState(20000);
    const { selectedProducts } = useSelectedProducts()
    const [dataShipping, setDataShipping] = useState([])
    const [showTerms, setShowTerms] = useState(false);
    const [isOpen, setIsOpen] = useState(false)
    const [isLoginOpen, setIsLoginOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAcceptTerms = () => {
        setShowTerms(false);
        setIsOpen(true)
    };

    useEffect(() => {


    }, [selectedProducts]);


    useEffect(() => {
        if (!isOpen) {
            setShowTerms(true);
        }

    }, [isOpen]);


    const [data, setData] = useState({
        fullName: "",
        addressType: "",
        phone: "",
        defaultAddress: false,
        detailAddress: "",
        fullAddress: ""
    });

    const fetchDataShipping = async (user) => {
        const res = await fetch(`${SummaryAip.getDataShipping.url}/${user}/address`, {
            method: SummaryAip.getDataShipping.method,
            "credentials": "include",
            headers: {
                "content-type": "application/json"
            },
        })
        const dataApi = await res?.json()
        setDataShipping(dataApi?.data)
    }
    useEffect(() => { if (dataUser?._id) fetchDataShipping(dataUser?._id) }, [dataUser])

    const {
        selectedCity,
        setSelectedCity,
        selectedDistrict,
        setSelectedDistrict,
        selectedWard,
        setSelectedWard,
        selectedTab,
        setSelectedTab,
        cities,
        districtsByCity,
        wardsByDistrict,
        dropdownVisible,
        setDropdownVisible,
        handleCitySelect,
        handleDistrictSelect,
        handleWardSelect

    } = useAddressSelection();

    const handleOnChange = (event) => {
        const { name, value, checked, type } = event.target;
        setData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun?.current) {
            if (data?.fullAddress) {
                const parts = data?.fullAddress?.split(' ');
                const city = parts?.slice(0, 2)?.join(' ');
                const district = parts?.slice(2, 4)?.join(' ');
                const ward = parts?.slice(4)?.join(' ');

                setSelectedCity(city);
                setSelectedDistrict(district);
                setSelectedWard(ward);
            }
            isFirstRun.current = false;
        }
    }, [data?.fullAddress]);

    const [selectedAddress, setSelectedAddress] = useState(() => {
        if (!dataShipping || dataShipping?.length === 0) {
            return null;
        }
        const defaultAddr = dataShipping?.find(address => address?.defaultAddress);

        return defaultAddr || dataShipping[0];
    });

    useEffect(() => {
        if (!dataShipping || dataShipping?.length === 0) {
            setSelectedAddress(null);
            return;
        }

        const defaultAddr = dataShipping?.find(address => address?.defaultAddress);
        setSelectedAddress(defaultAddr || dataShipping[0]);
    }, [dataShipping]);

    useEffect(() => {
        if (!isFirstRun.current) {
            handleOnChange({
                target: {
                    name: 'fullAddress',
                    value: `${selectedCity} ${selectedDistrict} ${selectedWard}`
                }
            });
        }
    }, [selectedCity, selectedDistrict, selectedWard]);

    const handlePaymentMethodChange = (method, type) => {
        setPaymentMethod(method);
        if (method === 'vnpay') {
            setPaymentType(type);
        }
    };
    const handleSelectAddress = (id) => {
        const address = dataShipping?.find(address => address?._id === id);
        setSelectedAddress(address);
        setIsModalOpen(false);
    };
    const handleShippingMethodChange = (method) => {
        setShippingMethod(method);
        if (method === 'FAST') {
            setShippingFee(20000);
        } else if (method === 'GO_JEK') {
            setShippingFee(25000);
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e?.target;
        setData(prevData => ({
            ...prevData,
            [name]: value
        }));
    }
    const handleUpdateInfo = async (e) => {
        e?.stopPropagation();
        e?.preventDefault();
        if (!user) {
            setIsLoginOpen(true);
            toast.error('Vui lòng đăng nhập..!');
        } else {
            const dataResponse = await fetch(SummaryAip.add_new_address.url, {
                method: SummaryAip.add_new_address.method,
                credentials: "include",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    userId: dataUser?._id,
                    ...data
                })
            });
            const dataApi = await dataResponse?.json();
            if (dataApi?.success) {
                toast.success(dataApi?.message);
                fetchDataShipping(dataUser?._id);
                setIsOpenModalUpdateInfo(false);
            } else {
                toast.error(dataApi?.message);
            }
        }
    };

    const total = selectedProducts?.reduce((total, product) => {
        return total + (product?.sellingPrice * product?.amount);
    }, 0) + shippingFee;

    const getSelectedProductInfo = (selectedProducts) => {
        return selectedProducts?.map(product => ({
            productId: product?._id,
            color: product?.selectedColor || "",
            colorImage: product?.selectedColorImage || product?.productImage,
            stock: product?.stock || product?.countInStock,
            price: product?.price,
            sellingPrice: product?.sellingPrice,
            quantity: product?.amount,
            productName: product?.productName
        }));
    };

    const handleLogin = () => {
        navigate('/login', { state: location?.pathname });
    }

    const handlePlaceOrder = async (e, productId) => {
        e?.stopPropagation();
        e?.preventDefault();

        if (!isOpen) {
            setShowTerms(true);
            return;
        }

        if (paymentMethod === 'vnpay') {
            await handleVNPayPayment(productId);
        } else if (paymentMethod === "momo") {
            await handleMomoPayment();
        } else {
            await handleCashOnDelivery()
        }
    };

    const makeApiRequest = async (url, method, body) => {
        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            return await response?.json();
        } catch (error) {
            toast.error("Đã xảy ra lỗi khi gọi API.");
            console.error(error);
        }
    };

    const handleCashOnDelivery = async () => {
        const products = getSelectedProductInfo(selectedProducts);
        const body = {
            amount: total,
            userId: dataUser?._id,
            products,
            shipping: shippingFee,
            shippingMethod,
            shippingAddress: selectedAddress,
            sourceApp: "ReactJS"
        };
        const datas = await makeApiRequest(SummaryAip.payment_COD.url, SummaryAip.payment_COD.method, body);
        if (datas?.error) {
            handlePaymentError(datas);
        } else {
            window.location.href = `${SummaryAip.paymentResult.url}`;
        }
    }

    const handleVNPayPayment = async (productId) => {
        const products = getSelectedProductInfo(selectedProducts);
        const body = {
            amount: total,
            language: "vn",
            bankCode: paymentType,
            userId: dataUser?._id,
            products,
            shipping: shippingFee,
            shippingMethod,
            shippingAddress: selectedAddress,
            sourceApp: "ReactJS"
        };

        const datas = await makeApiRequest(SummaryAip.payment_vnpay.url, SummaryAip.payment_vnpay.method, body);
        if (datas?.url) {
            window.location.href = datas.url;
        } else {
            handlePaymentError(datas);
        }
    };

    const handleMomoPayment = async () => {
        const products = getSelectedProductInfo(selectedProducts);
        const body = {
            amount: total,
            lang: "vi",
            userId: dataUser?._id,
            products,
            shipping: shippingFee,
            shippingMethod,
            shippingAddress: selectedAddress,
            sourceApp: "ReactJS"
        };
        const datas = await makeApiRequest(SummaryAip.payment_momo.url, SummaryAip.payment_momo.method, body);
        if (datas?.payUrl) {
            window.location.href = datas?.payUrl;
        } else {
            handlePaymentError(datas);
        }
    };

    const handlePaymentError = (datas) => {
        if (!user) {
            setIsLoginOpen(true);
            toast.error(datas?.message);
        } else if (datas?.error) {
            toast.error(datas?.message);
        }
    };

    const handleChange = (e) => {
        if (e.target.value === "shipping") {
            setIsOpenModalUpdateInfo(e.target.checked);
        } else if (e.target.value === "clause") {
            const isChecked = e.target.checked;

            if (!isChecked) {
                setShowTerms(true);
            } else {
                setIsOpen(isChecked);
            }
        }
    };

    const [shippingOrClause, setShippingOrClause] = useState({
        shipping: "shipping",
        clause: "clause"
    })

    return (
        <>
            {showTerms && <TermsModal onAccept={handleAcceptTerms} />}
            {
                !showTerms &&
                <div className="md:max-w-screen-xl mx-auto md:px-0 px-3 py-8">

                    <div className='flex relative items-end gap-5 pb-6'>
                        <h1 className="text-2xl font-bold uppercase">Thanh toán</h1>
                        <span className='font-medium'> <Link to={"/"} className='hover:text-red-500 capitalize cursor-pointer'>trang chủ</Link> / <Link to={"/cart"} className='hover:text-red-500 capitalize cursor-pointer'>giỏ hàng</Link> / Thanh Toán</span>
                        <div className='absolute bottom-0 left-1/2 -ml-[50vw] right-1/2 -mr-[50vw] h-0.5 bg-slate-200 z-10'></div>
                    </div>

                    <div className="grid mt-20 grid-cols-1 md:grid-cols-3 gap-6">
                        <div className='col-span-2'>
                            <PaymentProducts selectedProducts={selectedProducts} />
                            <>
                                <h2 className="text-2xl font-bold mb-4 uppercase">Địa chỉ giao hàng</h2>
                                {dataShipping.length > 0 ? (
                                    <>
                                        {selectedAddress && (
                                            <div className="p-4 bg-blue-100 border rounded-md mt-4 cursor-pointer" onClick={() => setIsModalOpen(true)}>
                                                <div className='flex items-center justify-between'>
                                                    <h3 className="text-lg font-bold mb-2">Địa chỉ đã chọn:</h3>
                                                    <p className='text-lg font-bold flex capitalize items-center gap-2'>Thay đổi <IoIosArrowDroprightCircle /></p>
                                                </div>
                                                <p className='font-medium'><span className='font-bold text-lg'>Họ tên:</span> {selectedAddress?.fullName}</p>
                                                <p className='font-medium'><span className='font-bold text-lg'>Địa chỉ:</span> {selectedAddress?.fullAddress}</p>
                                                <p className='font-medium'><span className='font-bold text-lg'>Số nhà, đường:</span> {selectedAddress?.detailAddress}</p>
                                                <p className='font-medium'><span className='font-bold text-lg'>Giao tới:</span> {selectedAddress?.addressType}</p>
                                                <p className='font-medium'><span className='font-bold text-lg'>Số điện thoại:</span> {selectedAddress?.phone}</p>
                                            </div>
                                        )}

                                        <GenericModal
                                            isOpen={isModalOpen}
                                            onClose={() => setIsModalOpen(false)}
                                            title="Chọn địa chỉ giao hàng"
                                            classNameCus="h-5/6"
                                            children={
                                                <div className='overflow-y-auto'>
                                                    {dataShipping?.map(address => (
                                                        <div key={address?._id} className="p-4 bg-gray-100 border rounded-md mb-4 cursor-pointer">
                                                            <label className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    name="selectedAddress"
                                                                    value={address?._id}
                                                                    checked={selectedAddress?._id === address?._id}
                                                                    onChange={() => handleSelectAddress(address?._id)}
                                                                    className="form-radio h-5 w-5 accent-red-500"
                                                                />
                                                                <div className="ml-4">
                                                                    <p className='font-semibold'>Họ tên: {address?.fullName}</p>
                                                                    <p className='font-semibold'>Địa chỉ: {address?.fullAddress}</p>
                                                                    <p className='font-semibold'>Số nhà, đường: {address?.detailAddress}</p>
                                                                    <p className='font-semibold'>Giao tới: {address?.addressType}</p>
                                                                    <p className='font-semibold'>Số điện thoại: {address?.phone}</p>
                                                                    <p className='font-bold text-red-500 uppercase'>{address?.defaultAddress ? "mặc định" : ""}</p>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    ))}
                                                    <div className="mt-4">
                                                        <label className="inline-flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                name="shippingAddress"
                                                                value={shippingOrClause.shipping}
                                                                checked={isOpenModalUpdateInfo}
                                                                onChange={handleChange}
                                                                className="form-checkbox h-4 w-4"
                                                            />
                                                            <span className="ml-2 font-bold">Gửi đến một địa chỉ khác?</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            }
                                            footer={
                                                <button onClick={() => setIsModalOpen(false)} className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                                                    Đóng
                                                </button>
                                            }
                                        />
                                        <div className="">
                                            <ShippingMethod
                                                shippingMethod={shippingMethod}
                                                handleShippingMethodChange={handleShippingMethodChange}
                                            />
                                        </div>
                                        <div
                                            className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpenModalUpdateInfo
                                                ? "max-h-screen opacity-100"
                                                : "max-h-0 opacity-0"
                                                }`}
                                        >
                                            {isOpenModalUpdateInfo && (
                                                <UpdateInfoModal
                                                    data={data}
                                                    handleOnChange={handleOnChange}
                                                    handleUpdateInfo={handleUpdateInfo}
                                                    setIsOpenModalUpdateInfo={setIsOpenModalUpdateInfo}
                                                />
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <form
                                        onSubmit={(e) => handleUpdateInfo(e)}
                                        className="p-4 border rounded-md">
                                        <h2 className="text-xl text-center uppercase font-bold mb-4">Nhập thông tin địa chỉ</h2>
                                        <div className="mb-4">
                                            <label className="block font-bold mb-2">Họ tên:</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={data?.fullName || ''}
                                                onChange={handleInputChange}
                                                className="w-full font-semibold p-2 border rounded-md"
                                            />
                                        </div>
                                        <div className="mb-4 relative">
                                            <label className="block font-bold mb-2">Địa chỉ</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name='fullAddress'
                                                    value={`${selectedWard} ${selectedDistrict} ${selectedCity}  `}
                                                    readOnly
                                                    onClick={() => setDropdownVisible(!dropdownVisible)}
                                                    className="w-full font-semibold p-2 border rounded cursor-pointer"
                                                    required
                                                />
                                            </div>
                                            {dropdownVisible && (
                                                <div className="absolute z-10 bg-white border w-full mt-2 rounded-md">
                                                    <div className="flex">
                                                        <button
                                                            type="button"
                                                            className={`w-1/3 font-semibold p-2 border-b-2 text-center ${selectedTab === 'city' ? 'text-red-500 border-red-500' : ''}`}
                                                            onClick={() => setSelectedTab('city')}
                                                        >
                                                            Tỉnh/Thành phố
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={`w-1/3 font-semibold p-2 border-b-2 text-center ${selectedTab === 'district' ? 'text-red-500 border-red-500' : ''}`}
                                                            onClick={() => setSelectedTab('district')}
                                                            disabled={!selectedCity}
                                                        >
                                                            Quận/Huyện
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={`w-1/3 font-semibold p-2 border-b-2 text-center ${selectedTab === 'ward' ? 'text-red-500 border-red-500' : ''}`}
                                                            onClick={() => setSelectedTab('ward')}
                                                            disabled={!selectedDistrict}
                                                        >
                                                            Phường/Xã
                                                        </button>
                                                    </div>
                                                    <div className="max-h-48 overflow-y-auto">
                                                        {selectedTab === 'city' && cities?.map(city => (
                                                            <div key={city} className="p-2 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleCitySelect(city)}>
                                                                {city}
                                                            </div>
                                                        ))}
                                                        {selectedTab === 'district' && districtsByCity[selectedCity]?.map(district => (
                                                            <div key={district} className="p-2 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleDistrictSelect(district)}>
                                                                {district}
                                                            </div>
                                                        ))}
                                                        {selectedTab === 'ward' && wardsByDistrict[selectedDistrict]?.map(ward => (
                                                            <div key={ward} className="p-2 font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleWardSelect(ward)}>
                                                                {ward}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mb-4">
                                            <label className="block font-bold mb-2">Số nhà, đường:</label>
                                            <input
                                                type="text"
                                                name="detailAddress"
                                                value={data?.detailAddress || ''}
                                                onChange={handleInputChange}
                                                className="w-full font-semibold p-2 border rounded-md"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block font-bold mb-2">Giao tới:</label>
                                            <div className="flex space-x-4">
                                                <button
                                                    type="button"
                                                    className={`py-2 px-4 border font-semibold rounded ${data?.addressType === 'Nhà Riêng' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border-blue-500'}`}
                                                    onClick={() => handleOnChange({ target: { name: 'addressType', value: 'Nhà Riêng' } })}
                                                >
                                                    Nhà Riêng
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`py-2 px-4 border font-semibold rounded ${data?.addressType === 'Văn Phòng' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border-blue-500'}`}
                                                    onClick={() => handleOnChange({ target: { name: 'addressType', value: 'Văn Phòng' } })}
                                                >
                                                    Văn Phòng
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block font-bold mb-2">Số điện thoại:</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={data?.phone || ''}
                                                onChange={handleInputChange}
                                                className="w-full font-semibold p-2 border rounded-md"
                                            />
                                        </div>
                                        <div className="flex justify-start items-center mb-4">
                                            <label className="flex items-center font-bold">
                                                <input
                                                    type="checkbox"
                                                    name='defaultAddress'
                                                    checked={data?.defaultAddress}
                                                    onChange={handleOnChange}
                                                    className="mr-2 accent-red-500"
                                                />
                                                Đặt làm địa chỉ mặc định
                                            </label>
                                        </div>
                                        <div className='flex items-center justify-center'>
                                            <button
                                                type="submit"
                                                className="bg-orange-500  text-white px-4 py-2 rounded font-bold uppercase hover:bg-orange-700"
                                            >
                                                Hoàn thành
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </>
                        </div>

                        <GenericModal
                            isOpen={isLoginOpen}
                            onClose={() => setIsLoginOpen(false)}
                            title='Xác nhận đăng nhập?'
                            children='Bạn có muốn đăng nhập để mua hàng không?'
                            footer={
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setIsLoginOpen(false)}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded mr-2"
                                    >
                                        Không
                                    </button>
                                    <button
                                        onClick={handleLogin}
                                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                                    >
                                        Có
                                    </button>
                                </div>
                            }
                        />

                        <PaymentSummary
                            handleChange={handleChange}
                            isOpen={isOpen}
                            total={total}
                            shippingOrClause={shippingOrClause}
                            shippingFee={shippingFee}
                            selectedProducts={selectedProducts}
                            paymentMethod={paymentMethod}
                            handlePaymentMethodChange={handlePaymentMethodChange}
                            handlePlaceOrder={handlePlaceOrder}
                        />
                    </div>
                </div>
            }
        </>

    );
};

export default PaymentPage;
