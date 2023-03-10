import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  useAnimatedReaction,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { mvs, s } from "react-native-size-matters/extend";
import { metrics } from "@constants/metrics";
import {
  BACK_BUTTON_HEIGHT,
  CARD_HEADER_HEIGHT,
  CARD_HEIGHT_CLOSED,
  CARD_HEIGHT_OPEN,
  CARD_IMAGE_HEIGTH,
  CARD_MARGIN,
  SPRING_CONFIG,
} from "../assets/config";
import { theme } from "../assets/theme";
import { CardProps } from "../assets/types";
import { Flex } from "@components/index";

const Card = ({
  item,
  index,
  selectedCard,
  scrollY,
  swipeY,
  inTransition,
}: CardProps) => {
  const animatedHeight = useSharedValue(CARD_HEIGHT_CLOSED);
  const transY = useSharedValue(0);
  const scale = useSharedValue(1);
  const marginTop = index * CARD_MARGIN;
  const spread = 70 * index;
  const spreadOffset = Math.min(2.5 * index * index, spread);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: animatedHeight.value,
      opacity: interpolate(
        scale.value,
        [0.9, 0.95],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [-metrics.screenHeight, 0],
            [50 + spread - spreadOffset, 0],
            Extrapolation.CLAMP,
          ),
        },
        { translateY: transY.value },
        {
          scale: scale.value,
        },
      ],
    };
  });

  useAnimatedReaction(
    () => swipeY.value,
    (current, previous) => {
      if (selectedCard.value === index) {
        transY.value = transY.value + current - (previous ?? 0);
      }
    },
  );

  useAnimatedReaction(
    () => selectedCard.value,
    (currentSelection, previousSelection) => {
      if (selectedCard.value !== -1) {
        const isSelected = selectedCard.value === index;
        const slideUp = currentSelection >= index;
        const animateToValue = slideUp
          ? scrollY.value - marginTop
          : scrollY.value +
            metrics.screenHeight -
            marginTop -
            BACK_BUTTON_HEIGHT;

        transY.value = isSelected
          ? withSpring(animateToValue, SPRING_CONFIG.OPEN)
          : withTiming(animateToValue);

        if (isSelected) {
          animatedHeight.value = withTiming(CARD_HEIGHT_OPEN);
        } else {
          slideUp && (scale.value = withTiming(0.9));
        }
      } else {
        if (previousSelection === index) {
          transY.value = withSpring(0, SPRING_CONFIG.CLOSE);
        } else {
          const wasAbove = (previousSelection ?? 0) > index;
          transY.value = withDelay(
            wasAbove ? 100 : 300,
            withTiming(0, {
              easing: Easing.out(Easing.quad),
            }),
          );
          wasAbove && (scale.value = withTiming(1));
        }

        animatedHeight.value > CARD_HEIGHT_CLOSED &&
          (animatedHeight.value = withTiming(CARD_HEIGHT_CLOSED));
      }
    },
  );

  const handleCardPress = () => {
    if (selectedCard.value === -1 && !inTransition.value) {
      selectedCard.value = index;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleCardPress} disabled={false}>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            marginTop,
            backgroundColor: item.bg,
          },
          animatedStyle,
        ]}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.headerSubcontainer}>
            <Text style={styles.fieldLabel}>{item.headerField.label}</Text>
            <Text style={styles.fieldValue}>{item.headerField.value}</Text>
          </View>
        </View>
        <Image resizeMode="cover" source={item.image} style={styles.image} />
        <View style={styles.cardSubContainer}>
          <Flex>
            <View style={styles.fieldSpacer}>
              <Text style={styles.fieldLabel}>{item.auxiliaryField.label}</Text>
              <Text style={[styles.fieldValue, { textTransform: "uppercase" }]}>
                {item.auxiliaryField.value}
              </Text>
            </View>

            <View style={[styles.fieldSpacer, styles.stContainer]}>
              <View>
                <Text style={styles.fieldLabel}>
                  {item.secondaryField.label}
                </Text>
                <Text style={styles.fieldValue}>
                  {item.secondaryField.value}
                </Text>
              </View>

              <View>
                <Text style={styles.fieldLabel}>
                  {item.tertiaryField.label}
                </Text>
                <Text style={[styles.fieldValue, { textAlign: "right" }]}>
                  {item.tertiaryField.value}
                </Text>
              </View>
            </View>
          </Flex>

          <View style={styles.qrContainer}>
            <Image
              source={require("../assets/images/qr-code.png")}
              style={styles.qr}
            />
          </View>
        </View>

        <View style={styles.borderOverlay} />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 12,
    position: "absolute",
    width: "100%",
    overflow: "hidden",
  },
  cardSubContainer: {
    paddingHorizontal: s(16),
    paddingBottom: s(16),
    height: CARD_HEIGHT_OPEN - CARD_HEADER_HEIGHT - CARD_IMAGE_HEIGTH,
  },
  title: {
    fontSize: mvs(18),
    fontWeight: "bold",
    color: theme.colors.white,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: s(16),
    height: CARD_HEADER_HEIGHT,
  },
  headerSubcontainer: {
    alignItems: "center",
  },
  fieldSpacer: { marginTop: s(32) },
  stContainer: { flexDirection: "row", justifyContent: "space-between" },
  fieldLabel: {
    fontSize: mvs(11),
    fontWeight: "600",
    color: theme.colors.white,
    textTransform: "uppercase",
  },
  fieldValue: {
    fontSize: mvs(21),
    color: theme.colors.white,
  },
  image: {
    height: CARD_IMAGE_HEIGTH,
    width: "100%",
  },
  qrContainer: {
    alignSelf: "center",
    padding: s(8),
    backgroundColor: theme.colors.white,
    borderRadius: s(6),
  },
  qr: { width: s(140), height: s(140) },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    position: "absolute",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});

export default Card;
