import React from "react";
import { View, Pressable, StyleSheet, ViewStyle, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";

export interface NavTab {
  name: string;
  icon: string;
  route: string;
}

interface Module2BottomNavProps {
  tabs: NavTab[];
  activeTab: string;
  onTabPress: (route: string) => void;
  style?: ViewStyle;
}

export function Module2BottomNav({ tabs, activeTab, onTabPress, style }: Module2BottomNavProps) {
  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Platform.OS === "android" ? 8 : 20 },
        style,
      ]}
    >
      <View style={styles.navBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.route;
          return (
            <Pressable
              key={tab.route}
              onPress={() => onTabPress(tab.route)}
              style={({ pressed }) => [styles.tabButton, pressed && { opacity: 0.8 }]}
            >
              <View
                style={[
                  styles.iconContainer,
                  isActive && {
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 15,
                    elevation: 10,
                  },
                ]}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={24}
                  color={isActive ? colors.onPrimary : colors.text.secondary}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 72,
    marginHorizontal: 16,
    backgroundColor: "rgba(17,33,48,0.9)",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 12,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 72,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
