import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { AsyncStorage } from '@react-native-async-storage/async-storage';
import { Focuss } from './src/features/focus/Focuss';
import { colors } from './src/utils/colors';
import { Timer } from './src/features/timer/Timer';
import { useKeepAwake } from 'expo-keep-awake';
import { spacing } from './src/utils/sizes';
import { FocusHistory } from './src/features/focus/FocusHistory';

const STATUS = {
  COMPLETE: 1,
  CANCELLED: 2,
};

export default function App() {
  useKeepAwake();
  const [focusSubject, setFocusSubjet] = useState(null);
  const [focusHistory, setFocusHistory] = useState([]);

  const addFocusHistorySubjectWithState = (subject, status) => {
    setFocusHistory([...focusHistory, {key: String(focusHistory.length + 1), subject, status }]);
  };

  const onClear = () => {
    setFocusHistory([]);
  };

  const saveFocusHistory = async () => {
    try {
      await AsyncStorage.setItem('focusHistory', JSON.stringify(focusHistory));
    } catch (e) {
      console.log(e);
    }
  };

  const loadFocusHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('focusHistory');

      if (history && JSON.parse(history).length) {
        setFocusHistory(JSON.parse(history));
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    loadFocusHistory();
  }, []);

  useEffect(() => {
    saveFocusHistory();
  }, [focusHistory]);

  return (
    <View style={styles.container}>
      {focusSubject ? (
        <Timer
          focusSubject={focusSubject}
          onTimerEnd={() => {
            addFocusHistorySubjectWithState(focusSubject, STATUS.COMPLETE);
            setFocusSubjet(null);
          }}
          clearSubject={() => {
            addFocusHistorySubjectWithState(focusSubject, STATUS.CANCELLED);
            setFocusSubjet(null);
          }}
        />
      ) : (
        <>
          <Focuss addSubject={setFocusSubjet} />
          <FocusHistory focusHistory={focusHistory} onClear={onClear} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBlue,
    paddingTop: Platform.os === 'ios' ? spacing.md : spacing.lg,
  },
});
