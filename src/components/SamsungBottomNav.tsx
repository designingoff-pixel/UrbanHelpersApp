import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/types";
import { useNavigation, useRoute } from "@react-navigation/native";

export const NAV_TABS = [
  { icon: "home",            route: "HomeDashboard" as keyof RootStackParamList,    label: "Home" },
  { icon: "flag-outline",    route: "FamilyDashboard" as keyof RootStackParamList,  label: "Together" },
  { icon: "compass-outline", route: "Discover" as keyof RootStackParamList,         label: "Discover" },
  { icon: "calendar-outline",route: "FitnessDashboard" as keyof RootStackParamList, label: "Fitness" },
];

interface Props {
  activeRoute: keyof RootStackParamList;
}

export default function SamsungBottomNav({ activeRoute }: Props) {
  const navigation = useNavigation<any>();

  return (
    <View style={s.navBar}>
      {NAV_TABS.map((n) => {
        const isActive = activeRoute === n.route;
        return (
          <Pressable
            key={n.route}
            onPress={() => {
              if (!isActive) navigation.navigate(n.route);
            }}
            style={s.navBtn}
          >
            <View style={[s.navIconWrapper, isActive && s.navIconWrapperActive]}>
              <Ionicons
                name={isActive ? n.icon.replace('-outline', '') as any : n.icon as any}
                size={22}
                color={isActive ? "#FFFFFF" : "rgba(255,255,255,0.6)"}
              />
            </View>
            <Text style={[s.navLabel, isActive && s.navLabelActive]}>
              {n.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  navBar: {
    position: "absolute", 
    bottom: 0, 
    left: 16, 
    right: 16,
    flexDirection: "row",
    height: 64, // Reduced from 80 to 64
    marginBottom: 20,
    backgroundColor: "#1c232f", // Slightly brighter than #161b22 so it pops
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  navBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navIconWrapper: {
    width: 44,
    height: 28, // Reduced height for the active pill
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  navIconWrapperActive: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  navLabel: { 
    fontSize: 10, // Adjusted font size
    color: "rgba(255,255,255,0.6)", 
    marginTop: 4, 
    fontWeight: "500" 
  },
  navLabelActive: { 
    color: "#FFFFFF", 
    fontWeight: "700" 
  },
});
