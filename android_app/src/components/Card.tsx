import React from "react";
import { Pressable, View, ViewProps } from "react-native";

type Props = ViewProps & {
  dark?: boolean;
  large?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
};

/** Generic rounded card surface used across dashboard grids. */
export function Card({ dark, large, onPress, style, children, ...rest }: Props) {
  const radius = large ? "rounded-card-lg" : "rounded-card";
  const bg = dark ? "bg-surface-card" : "bg-background-card";
  const className = `${radius} ${bg} p-4`;

  if (onPress) {
    return (
      <Pressable className={`${className} active:opacity-80`} onPress={onPress} style={style}>
        {children}
      </Pressable>
    );
  }

  return (
    <View className={className} style={style} {...rest}>
      {children}
    </View>
  );
}
