import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableNativeFeedback, Dimensions } from 'react-native';
import posed from 'react-native-pose'; // react-native 动画库

const Scaler = posed.View({
  // 定义点击缩放
  active: { scale: 1 },
  inactive: { scale: 0.9 }
});

const TabBar = (props) => {
  const { renderIcon, getLabelText, activeTintColor, inactiveTintColor, onTabPress, onTabLongPress, getAccessibilityLabel, navigation } = props;

  const { routes, index: activeRouteIndex } = navigation.state;
  return (
    <Scaler style={Styles.container}>
      {routes.map((route, routeIndex) => {
        const isRouteActive = routeIndex === activeRouteIndex;
        const tintColor = isRouteActive ? activeTintColor : inactiveTintColor;
        return (
          <TouchableNativeFeedback
            key={routeIndex}
            style={Styles.tabButton}
            onPress={() => {
              onTabPress({ route });
            }}
            onLongPress={() => {
              onTabLongPress({ route });
            }}
            accessibilityLabel={getAccessibilityLabel({ route })}
          >
            {route.key == 'three' ? ( // 对特殊图标进行特殊处理
              <Scaler style={Styles.scalerOnline} pose={isRouteActive ? 'active' : 'inactive'}>
                {renderIcon({ route, focused: isRouteActive, tintColor })}
                <Text style={Styles.iconText}>{getLabelText({ route })}</Text>
              </Scaler>
            ) : (
              // 普通图标普通处理
              <Scaler style={Styles.scaler} pose={isRouteActive ? 'active' : 'inactive'}>
                {renderIcon({ route, focused: isRouteActive, tintColor })}
                <Text style={Styles.iconText}>{getLabelText({ route })}</Text>
              </Scaler>
            )}
          </TouchableNativeFeedback>
        );
      })}
    </Scaler>
  );
};

const Styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 53,
    borderWidth: 1,
    borderRadius: 1,
    borderColor: '#000000',
    shadowOffset: { width: 5, height: 10 },
    shadowOpacity: 0.75,
    elevation: 1
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  spotLight: {
    width: tabWidth,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  spotLightInner: {
    width: 48,
    height: 48,
    backgroundColor: '#ee0000',
    borderRadius: 24
  },
  scaler: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scalerOnline: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  iconText: {
    fontSize: 12,
    lineHeight: 20
  }
});

export default TabBar;
