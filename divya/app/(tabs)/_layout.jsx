import { StatusBar } from "expo-status-bar";
import { Redirect, Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useSelector } from "react-redux";
import { Loader } from "../../components";
import Icon from "react-native-vector-icons/Ionicons"; // Use Ionicons or other icon libraries

const TabIcon = ({ iconName, color, name, focused }) => {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", gap: 1 ,width : 100}}>
      {/* Use the Ionicons icon with vector icons */}
      <Icon name={iconName} size={30} color={color} style={{ opacity: 1 }} />
      {/* Text component for the label */}
      <Text
        style={{
          color: color,
          fontSize: 10,
          fontWeight: focused ? "600" : "400",
        }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabLayout = () => {
  const { loading, user, verified, role } = useSelector((state) => state.user);

  if (!loading && !user && verified) return <Redirect href="/sign-in" />;

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#468585",
          tabBarInactiveTintColor: "#BDC3C7",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "white",
            height: 84, // Adjusted tab bar height
            paddingBottom: 10,
            paddingTop: 14,
          },
          tabBarIconStyle: {
            opacity: 1, // Force opacity to 1 for inactive icons
          },
        }}
      >
        {/* Common Tabs for Both Roles */}
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="home-outline"
                color={color}
                name="Home"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="orders"
          options={{
            title: "Orders",
            headerShown: false,
            href: role === "shopOwner" ? "/orders" : null,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="list-outline"
                color={color}
                name="Orders"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="products"
          options={{
            title: "Products",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="cube-outline"
                color={color}
                name="Products"
                focused={focused}
              />
            ),
          }}
        />

        {/* Role-Specific Tabs */}
        <Tabs.Screen
          name="myorders"
          options={{
            title: "My Orders",
            headerShown: false,
            href: role === "customer" ? "/myorders" : null,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="list-outline"
                color={color}
                name="My Orders"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="customers"
          options={{
            title: "Customers",
            headerShown: false,
            href: role === "shopOwner" ? "/customers" : null,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="people-outline"
                color={color}
                name="Customers"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName="settings-outline"
                color={color}
                name="Settings"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>

      {/* These components should be outside of Tabs */}
      <StatusBar backgroundColor="#468585" style="light" />
    </>
  );
};

export default TabLayout;
