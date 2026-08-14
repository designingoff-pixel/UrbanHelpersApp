import React from "react";
import { View, ViewStyle } from "react-native";

export interface MasonryItem {
  id: string;
  component: React.ReactNode;
  width?: number; // 1-2, where 2 means full width
  height?: number; // base unit, 1-3
}

interface MasonryGridProps {
  items: MasonryItem[];
  columns?: number;
  gap?: number;
  style?: ViewStyle;
}

/**
 * Masonry grid layout - arranges items in a responsive grid
 * Each item can span 1-2 columns and have variable heights
 */
export function MasonryGrid({
  items,
  columns = 2,
  gap = 16,
  style,
}: MasonryGridProps) {
  // Split items into columns
  const columnHeights = new Array(columns).fill(0);
  const grid: MasonryItem[][] = new Array(columns).fill(null).map(() => []);

  items.forEach((item) => {
    const width = item.width || 1;

    if (width === 2 && columns >= 2) {
      // Full width item - add to shortest column
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      grid[shortestColumn].push(item);
      columnHeights[shortestColumn] += (item.height || 1) * 140 + gap;
    } else {
      // Single column item - add to shortest column
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      grid[shortestColumn].push(item);
      columnHeights[shortestColumn] += (item.height || 1) * 120 + gap;
    }
  });

  return (
    <View style={[{ flexDirection: "row", gap }, style]}>
      {grid.map((column, idx) => (
        <View key={idx} style={{ flex: 1 / columns, gap }}>
          {column.map((item) => (
            <View
              key={item.id}
              style={{
                height: (item.height || 1) * 120,
                width: item.width === 2 ? "200%" : "100%",
              }}
            >
              {item.component}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
