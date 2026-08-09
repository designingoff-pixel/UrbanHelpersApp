import React from "react";
import { View, ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = ViewProps & {
  dark?: boolean;
  children: React.ReactNode;
};

/** Base wrapper every screen uses for consistent safe-area + background handling. */
export function ScreenContainer({ dark, style, children, ...rest }: Props) {
  return (
    <SafeAreaView
      className={dark ? "flex-1 bg-surface-dark" : "flex-1 bg-background-light"}
      style={style}
      {...rest}
    >
      <View className="flex-1">{children}</View>
    </SafeAreaView>
  );
}
