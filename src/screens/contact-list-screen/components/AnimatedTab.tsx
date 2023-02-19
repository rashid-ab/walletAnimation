import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { vs } from "react-native-size-matters/extend";
import Icon from "react-native-vector-icons/Ionicons";
import { BAR_LENGHT, BAR_PADDING } from "../assets/tab-config";
import { theme } from "../assets/theme";
import { AnimatedTabProps } from "./types";

const AnimatedTab = ({
  iconName,
  iconSize,
  iconScaleFactor,
  onPress,
  progress,
  index,
}: AnimatedTabProps) => {
  const translateX = progress.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [
      -BAR_LENGHT - BAR_PADDING / 3,
      0,
      BAR_LENGHT + BAR_PADDING / 3,
    ],
    extrapolate: "clamp",
  });

  const opacity = progress.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [0, 1, 0],
    extrapolate: "clamp",
  });

  const scale = progress.interpolate({
    inputRange: [index - 1, index - 0.5, index, index + 0.5, index + 1],
    outputRange: [1, iconScaleFactor, 1, iconScaleFactor, 1],
    extrapolate: "clamp",
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.barContainer}>
        <Animated.View style={[styles.bar, { transform: [{ translateX }] }]} />
      </View>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Icon
          name={`${iconName}-outline`}
          size={iconSize}
          color={theme.colors.gray}
          style={{ position: "absolute" }}
        />
        <Animated.View style={{ opacity }}>
          <Icon name={iconName} size={iconSize} color={theme.colors.white} />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  barContainer: {
    height: 3,
    width: BAR_LENGHT,
    backgroundColor: theme.colors.gray,
    overflow: "hidden",
    borderRadius: 1,
    marginBottom: vs(10),
  },
  bar: {
    width: BAR_LENGHT,
    height: 3,
    borderRadius: 1,
    backgroundColor: theme.colors.white,
  },
});

export default AnimatedTab;
