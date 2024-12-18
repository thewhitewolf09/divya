import { useSelector } from "react-redux";
import CustomerHome from "../home/CustomerHome";
import ShopOwnerHome from "../home/ShopOwnerHome";

const Home = () => {
  const { user, role } = useSelector((state) => state.user);
  return (
    <>
      {role === "customer" ? (
        <CustomerHome />
      ) : (
        <ShopOwnerHome />
      )}
    </>
  );
};

export default Home;
