import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { BASE_URL } from "../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/users/login`, {
        email,
        password,
      });
      const { user, accessToken } = response.data;
      setUserInfo(user);
      setUserToken(accessToken);
      await AsyncStorage.setItem("userInfo", JSON.stringify(user));
      await AsyncStorage.setItem("userToken", accessToken);
      setIsLogged(true); 
    } catch (error) {
      throw new Error(error.response?.data?.resultMessage || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/users/register`, {
        name,
        email,
        password,
      });
      const { user, accessToken } = response.data;
      setUserInfo(user);
      setUserToken(accessToken);
      await AsyncStorage.setItem("userInfo", JSON.stringify(user));
      await AsyncStorage.setItem("userToken", accessToken);
      setIsLogged(true); 
    } catch (error) {
      console.error(`Signup Error: ${error}`);
      throw new Error(error.response?.data?.resultMessage || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      setUserToken(null);
      await AsyncStorage.removeItem("userInfo");
      await AsyncStorage.removeItem("userToken");
      setIsLogged(false);
    } catch (error) {
      throw new Error(error.response?.data?.resultMessage || "Logout failed");
    } finally {
      setLoading(false);
    }
  };
  const delAcc = async () => {
    setLoading(true);
    try {
      setUserToken(null);
      await AsyncStorage.removeItem("userInfo");
      await AsyncStorage.removeItem("userToken");
      setIsLogged(false);
    } catch (error) {
      throw new Error(error.response?.data?.resultMessage || "Account Deletion failed");
    } finally {
      setLoading(false);
    }
  };

  const checkLoggedIn = async () => {
    try {
      const storedUserInfo = await AsyncStorage.getItem("userInfo");
      const storedUserToken = await AsyncStorage.getItem("userToken");
      if (storedUserInfo && storedUserToken) {
        setUserInfo(JSON.parse(storedUserInfo));
        setUserToken(storedUserToken);
        setIsLogged(true); 
      }
    } catch (error) {
      console.error(`Check Login Status Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLoggedIn();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        userInfo,
        setUserInfo,
        userToken,
        setUserToken,
        login,
        signup,
        logout,
        loading,
        delAcc
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
