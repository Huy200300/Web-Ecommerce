import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { toast } from "react-toastify";
import fetchAllProducts from "../helpers/fetchAllProducts";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const cartRef = useRef(cart);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const updatedProducts = await fetchAllProducts("Completed");

        const updatedCart = cartRef.current?.map((cartItem) => {
          const productFromDB = updatedProducts?.find(
            (product) => product?._id === cartItem?._id
          );
          if (
            productFromDB &&
            new Date(productFromDB?.updatedAt) > new Date(cartItem?.updatedAt)
          ) {
            return { ...cartItem, ...productFromDB };
          }
          return cartItem;
        });

        if (
          JSON?.stringify(updatedCart) !== JSON?.stringify(cartRef?.current)
        ) {
          setCart(updatedCart);
          localStorage?.setItem("cart", JSON?.stringify(updatedCart));
          cartRef.current = updatedCart;
        }
      } catch (error) {
        console.error("Error fetching updated products:", error);
      }
    }, 6000);

    return () => clearInterval(intervalId);
  }, []);

  // useEffect(() => {
  //   const intervalId = setInterval(async () => {
  //     try {
  //       const updatedProducts = await fetchAllProducts("Completed");

  //       const updatedCart = cartRef.current
  //         .filter((cartItem) =>
  //           updatedProducts?.some((product) => product?._id === cartItem?._id)
  //         )
  //         .map((cartItem) => {
  //           const productFromDB = updatedProducts?.find(
  //             (product) => product?._id === cartItem?._id
  //           );
  //           if (
  //             productFromDB &&
  //             new Date(productFromDB?.updatedAt) > new Date(cartItem?.updatedAt)
  //           ) {
  //             return { ...cartItem, ...productFromDB };
  //           }
  //           return cartItem;
  //         });

  //       if (JSON.stringify(updatedCart) !== JSON.stringify(cartRef.current)) {
  //         setCart(updatedCart);
  //         localStorage.setItem("cart", JSON.stringify(updatedCart));
  //         cartRef.current = updatedCart;
  //       }
  //     } catch (error) {
  //       console.error("Error fetching updated products:", error);
  //     }
  //   }, 6000);

  //   return () => clearInterval(intervalId);
  // }, []);

  const addToCart = (product) => {
    const existingProduct = cart?.find(
      (item) =>
        item?._id === product?._id &&
        item?.selectedColor === product?.selectedColor &&
        item?.selectedStorage === product?.selectedStorage
    );

    if (existingProduct) {
      return toast.error(
        `Sản phẩm đã có trong giỏ hàng với màu "${product?.selectedColor}" ${
          product?.selectedStorage
            ? `và dung lượng ${product?.selectedStorage}`
            : ""
        }.`
      );
    } else {
      const updatedCart = [...cart, product];
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      toast.success("Sản phẩm đã được thêm vào giỏ hàng");
    }
  };

  const updateCart = (updates) => {
    setCart((prevCart) => {
      const updatesArray = Array?.isArray(updates) ? updates : [updates];
      const updatedCart = prevCart
        ?.map((item) => {
          const update = updatesArray?.find((u) => {
            const isProductMatch = u?.productId === item?._id;
            const isColorMatch =
              !u?.selectedColor || u?.selectedColor === item?.selectedColor;
            const isSizeMatch =
              !u?.selectedSize || u?.selectedSize === item?.selectedStorage;

            return isProductMatch && isColorMatch && isSizeMatch;
          });
          if (update) {
            const newQuantity = item?.amount + update?.quantityChange;
            return newQuantity > 0 ? { ...item, amount: newQuantity } : null;
          }

          return item;
        })
        .filter(Boolean);

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const removeFromCart = (productIds) => {
    const updatedCart = cart?.filter(
      (product) => !productIds?.includes(product?._id)
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    cartRef.current = updatedCart;
    toast.warning("Các sản phẩm đã được xóa khỏi giỏ hàng");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        cartLength: cart?.length,
        updateCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
