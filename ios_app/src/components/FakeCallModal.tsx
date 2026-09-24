import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Vibration,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FakeCallModalProps {
  visible: boolean;
  onDismiss: () => void;
  callerName?: string;
  callerNumber?: string;
}

export const FakeCallModal: React.FC<FakeCallModalProps> = ({
  visible,
  onDismiss,
  callerName = 'Mom',
  callerNumber = '+91 98765 43210',
}) => {
  const [callState, setCallState] = useState<'ringing' | 'connected'>('ringing');
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let timer: any;
    if (visible && callState === 'ringing') {
      // Vibrate pattern for incoming call
      const pattern = [500, 1000, 500, 1000];
      Vibration.vibrate(pattern, true);
    } else if (visible && callState === 'connected') {
      Vibration.cancel();
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      Vibration.cancel();
      if (timer) clearInterval(timer);
    };
  }, [visible, callState]);

  const handleAccept = () => {
    Vibration.cancel();
    setCallState('connected');
  };

  const handleDecline = () => {
    Vibration.cancel();
    setCallState('ringing');
    setCallDuration(0);
    onDismiss();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={handleDecline}>
      <View style={styles.container}>
        {/* Top Caller Details */}
        <View style={styles.topSection}>
          <View style={styles.avatarWrap}>
            <Ionicons name="person" size={54} color="#ffffff" />
          </View>
          <Text style={styles.callerName}>{callerName}</Text>
          <Text style={styles.callerNumber}>{callerNumber}</Text>
          <Text style={styles.callStatus}>
            {callState === 'ringing' ? 'Incoming Call...' : formatTime(callDuration)}
          </Text>
        </View>

        {/* Center / Action Area */}
        <View style={styles.centerSection}>
          {callState === 'connected' && (
            <View style={styles.connectedControls}>
              <View style={styles.controlIconWrap}>
                <Ionicons name="mic-off-outline" size={24} color="#ffffff" />
                <Text style={styles.controlLabel}>Mute</Text>
              </View>
              <View style={styles.controlIconWrap}>
                <Ionicons name="keypad-outline" size={24} color="#ffffff" />
                <Text style={styles.controlLabel}>Keypad</Text>
              </View>
              <View style={styles.controlIconWrap}>
                <Ionicons name="volume-high-outline" size={24} color="#ffffff" />
                <Text style={styles.controlLabel}>Speaker</Text>
              </View>
            </View>
          )}
        </View>

        {/* Bottom Call Buttons */}
        <View style={styles.bottomSection}>
          {callState === 'ringing' ? (
            <View style={styles.ringingButtonsRow}>
              {/* Decline Button */}
              <TouchableOpacity style={[styles.callBtn, styles.declineBtn]} onPress={handleDecline}>
                <Ionicons name="call" size={30} color="#ffffff" style={{ transform: [{ rotate: '135deg' }] }} />
                <Text style={styles.btnLabel}>Decline</Text>
              </TouchableOpacity>

              {/* Accept Button */}
              <TouchableOpacity style={[styles.callBtn, styles.acceptBtn]} onPress={handleAccept}>
                <Ionicons name="call" size={30} color="#ffffff" />
                <Text style={styles.btnLabel}>Accept</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[styles.callBtn, styles.endCallBtn]} onPress={handleDecline}>
              <Ionicons name="call" size={32} color="#ffffff" style={{ transform: [{ rotate: '135deg' }] }} />
              <Text style={styles.btnLabel}>End Call</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  avatarWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  callerName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  callerNumber: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 6,
  },
  callStatus: {
    fontSize: 16,
    color: '#38BDF8',
    fontWeight: '600',
    marginTop: 12,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  controlIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
  },
  controlLabel: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 4,
  },
  bottomSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ringingButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  callBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtn: {
    backgroundColor: '#EF4444',
  },
  acceptBtn: {
    backgroundColor: '#10B981',
  },
  endCallBtn: {
    backgroundColor: '#EF4444',
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  btnLabel: {
    position: 'absolute',
    bottom: -22,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
