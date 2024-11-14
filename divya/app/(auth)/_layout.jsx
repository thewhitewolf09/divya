import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { Loader } from "../../components";
import { useSelector } from "react-redux";

const AuthLayout = () => {
  const { loading, user, verified } = useSelector((state) => state.user);

  const isLogged = user !== null;

  if (!loading && isLogged && verified) {
    return <Redirect href="/home" />;
  }

  return (
    <>
      <Stack>
        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sign-up"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar backgroundColor="#468585" style="light" />
    </>
  );
};

export default AuthLayout;
