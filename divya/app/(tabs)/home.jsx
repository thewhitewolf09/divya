import {useSelector } from "react-redux";
import CustomerHome from "../home/CustomerHome";
import ShopOwnerHome from "../home/ShopOwnerHome";

const Home = () => {
  const { user } = useSelector((state) => state.user);
  return (
    <>
      {user.role === "customer" ? (
        <CustomerHome user={user} />
      ) : (
        <ShopOwnerHome user={user} />
      )}
    </>
  );
};

export default Home;
