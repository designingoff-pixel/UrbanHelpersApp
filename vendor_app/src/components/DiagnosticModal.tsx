import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface DiagnosticStep {
  title: string;
  desc: string;
  expected: string;
  icon: string;
}

interface CategoryDiagnostic {
  categoryName: string;
  icon: string;
  color: string;
  steps: DiagnosticStep[];
}

const DIAGNOSTICS_DATA: Record<string, CategoryDiagnostic> = {
  ro: {
    categoryName: 'RO Water Purifier Diagnostic',
    icon: 'water-outline',
    color: '#0284C7',
    steps: [
      {
        title: 'Step 1: Input TDS & Pressure Check',
        desc: 'Measure raw tap water TDS with digital meter and check inlet water pressure (> 0.5 bar required).',
        expected: 'Raw TDS < 2000 ppm. Inlet flow constant.',
        icon: 'speedometer-outline',
      },
      {
        title: 'Step 2: Pre-Filter & Carbon Stage',
        desc: 'Inspect spun polypropylene filter for silt accumulation and carbon block for chemical exhaustion.',
        expected: 'Clear water output with no foul chlorine odor.',
        icon: 'filter-outline',
      },
      {
        title: 'Step 3: RO Membrane Rejection Rate',
        desc: 'Measure purified water TDS. Rejection efficiency = ((Raw - Pure)/Raw) * 100.',
        expected: 'Purified water TDS between 50 - 150 ppm (90%+ rejection).',
        icon: 'analytics-outline',
      },
      {
        title: 'Step 4: Auto-Shutoff & Booster Pump',
        desc: 'Ensure booster pump produces 80-100 PSI and solenoid valve shuts off when tank fills.',
        expected: 'Pump silent operation; SV seals without dripping.',
        icon: 'checkmark-done-circle-outline',
      },
    ],
  },
  ac: {
    categoryName: 'AC & Appliance Diagnostic',
    icon: 'snow-outline',
    color: '#0284C7',
    steps: [
      {
        title: 'Step 1: Power & Voltage Stability',
        desc: 'Test electrical supply voltage at indoor unit terminals (measure L-N and L-E).',
        expected: '220V - 240V ± 5%. Stable grounding.',
        icon: 'flash-outline',
      },
      {
        title: 'Step 2: Suction / Discharge Gas Pressure',
        desc: 'Connect manifold pressure gauge to suction service port. Check R32/R410A operating PSI.',
        expected: 'R32 / R410A suction PSI ~ 120-140 PSI during cooling mode.',
        icon: 'speedometer-outline',
      },
      {
        title: 'Step 3: Delta T (Temperature Drop)',
        desc: 'Measure Return Air temp vs Supply Grill temp with laser thermometer.',
        expected: 'Temperature differential (ΔT) between 8°C to 12°C.',
        icon: 'thermometer-outline',
      },
      {
        title: 'Step 4: Condenser Drain & Fan RPM',
        desc: 'Inspect condensate drain tray for blockages, blower wheel balance, and outdoor fan vibration.',
        expected: 'Smooth condensation drainage, zero water backflow.',
        icon: 'checkmark-done-circle-outline',
      },
    ],
  },
  cleaning: {
    categoryName: 'Deep Cleaning Diagnostic & Audit',
    icon: 'sparkles-outline',
    color: '#10B981',
    steps: [
      {
        title: 'Step 1: Surface & Stain Type Assessment',
        desc: 'Identify hard water scale, grout grime, oil/grease deposits, or mold/mildew.',
        expected: 'Select appropriate neutral / alkaline / descaling agent.',
        icon: 'eye-outline',
      },
      {
        title: 'Step 2: High-Touch Sanitization Protocol',
        desc: 'Pre-treat switches, door handles, taps, faucets, kitchen backsplashes, and under-bed areas.',
        expected: 'Hospital-grade disinfectant contact time > 5 minutes.',
        icon: 'shield-checkmark-outline',
      },
      {
        title: 'Step 3: Floor Scrubbing & Extraction',
        desc: 'Deep buffing of marble / tile / wooden flooring and vacuum extraction of corners.',
        expected: 'Zero dust residue on white glove test.',
        icon: 'brush-outline',
      },
      {
        title: 'Step 4: Odor Neutralization & Air Freshening',
        desc: 'Final inspection of drains, traps, upholstery and organic citrus freshener mist.',
        expected: 'Fresh ambient scent and spotless luster.',
        icon: 'checkmark-done-circle-outline',
      },
    ],
  },
  pest: {
    categoryName: 'Pest Control Chemical & Safety Audit',
    icon: 'shield-outline',
    color: '#D97706',
    steps: [
      {
        title: 'Step 1: Infestation Hotspot Mapping',
        desc: 'Inspect kitchen cabinet hinges, drain pipes, false ceilings, and wooden baseboards.',
        expected: 'Locate harborage nests and identify species.',
        icon: 'search-outline',
      },
      {
        title: 'Step 2: Chemical Dilution & Safety Ratio',
        desc: 'Prepare WHO-approved synthetic pyrethroid / gel bait with exact dilution ratios.',
        expected: 'Wear N95 mask, nitrile gloves & verify child/pet safety protocol.',
        icon: 'flask-outline',
      },
      {
        title: 'Step 3: Micro-Droplet & Gel Ingestion Placement',
        desc: 'Apply targeted dots in concealed corners and spray perimeter barrier along skirting.',
        expected: '1 dot per 1m perimeter in dark non-food contact areas.',
        icon: 'color-wand-outline',
      },
      {
        title: 'Step 4: Customer Safety Briefing',
        desc: 'Advise customer on ventilation period (2-3 hrs) and dry wiping guidelines.',
        expected: 'Safety briefing acknowledged by customer.',
        icon: 'checkmark-done-circle-outline',
      },
    ],
  },
  general: {
    categoryName: 'Standard Diagnostic & Safety Protocol',
    icon: 'construct-outline',
    color: '#0D3325',
    steps: [
      {
        title: 'Step 1: Pre-Service Inspection',
        desc: 'Perform visual inspection of customer site, equipment, and confirm customer scope.',
        expected: 'Customer confirms exact issue and approves service area.',
        icon: 'clipboard-outline',
      },
      {
        title: 'Step 2: Tool Calibration & Safety Check',
        desc: 'Verify safety gear, insulated tools, protective floor sheets, and device battery.',
        expected: 'Zero safety hazards detected.',
        icon: 'shield-outline',
      },
      {
        title: 'Step 3: Step-by-Step Procedure Execution',
        desc: 'Follow standard operating procedure (SOP) with manufacturer-approved methodology.',
        expected: 'Flawless execution without property damage.',
        icon: 'hammer-outline',
      },
      {
        title: 'Step 4: Quality Benchmark & Handover',
        desc: 'Demonstrate completed fix/service to customer and verify functioning.',
        expected: 'Customer signs off on successful operation.',
        icon: 'checkmark-done-circle-outline',
      },
    ],
  },
};

interface DiagnosticModalProps {
  visible: boolean;
  onClose: () => void;
  serviceCategory?: string;
  subServiceName?: string;
}

export default function DiagnosticModal({
  visible,
  onClose,
  serviceCategory = '',
  subServiceName = '',
}: DiagnosticModalProps) {
  const [selectedKey, setSelectedKey] = useState<string>('auto');
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);

  const query = `${serviceCategory} ${subServiceName}`.toLowerCase();
  let defaultKey = 'general';
  if (query.includes('ro') || query.includes('water') || query.includes('purif')) {
    defaultKey = 'ro';
  } else if (query.includes('ac') || query.includes('appliance') || query.includes('cool') || query.includes('refrigerat')) {
    defaultKey = 'ac';
  } else if (query.includes('clean') || query.includes('maid') || query.includes('housekeep')) {
    defaultKey = 'cleaning';
  } else if (query.includes('pest') || query.includes('termite') || query.includes('cockroach')) {
    defaultKey = 'pest';
  }

  const activeKey = selectedKey === 'auto' ? defaultKey : selectedKey;
  const currentDiag = DIAGNOSTICS_DATA[activeKey] || DIAGNOSTICS_DATA.general;

  const toggleStep = (idx: number) => {
    setCheckedSteps(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <LinearGradient colors={['#0D3325', '#164E3A']} style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.badgePill}>
                <Ionicons name="hardware-chip-outline" size={13} color="#34D399" />
                <Text style={styles.badgePillText}>AR DIAGNOSTIC ASSISTANT</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.headerTitle}>{currentDiag.categoryName}</Text>
            <Text style={styles.headerSub}>
              Interactive step-by-step diagnostic workflow and calibration guidelines for field technicians.
            </Text>

            {/* Category Selector Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catTabs}>
              {Object.keys(DIAGNOSTICS_DATA).map(k => {
                const item = DIAGNOSTICS_DATA[k];
                const isActive = activeKey === k;
                return (
                  <TouchableOpacity
                    key={k}
                    style={[styles.catTab, isActive && styles.catTabActive]}
                    onPress={() => {
                      setSelectedKey(k);
                      setCheckedSteps([]);
                    }}
                  >
                    <Ionicons name={item.icon as any} size={14} color={isActive ? '#0D3325' : '#FFFFFF'} />
                    <Text style={[styles.catTabText, isActive && styles.catTabTextActive]}>
                      {item.categoryName.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </LinearGradient>

          {/* Steps List */}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>
                Completed Steps: {checkedSteps.length} / {currentDiag.steps.length}
              </Text>
              <Text style={styles.progressPercent}>
                {Math.round((checkedSteps.length / currentDiag.steps.length) * 100)}%
              </Text>
            </View>

            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${(checkedSteps.length / currentDiag.steps.length) * 100}%` },
                ]}
              />
            </View>

            {currentDiag.steps.map((st, idx) => {
              const isDone = checkedSteps.includes(idx);
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.stepCard, isDone && styles.stepCardDone]}
                  onPress={() => toggleStep(idx)}
                  activeOpacity={0.8}
                >
                  <View style={styles.stepHeader}>
                    <View style={[styles.stepIconWrap, isDone && styles.stepIconDone]}>
                      <Ionicons
                        name={isDone ? 'checkmark-circle' : (st.icon as any)}
                        size={20}
                        color={isDone ? '#10B981' : '#0D3325'}
                      />
                    </View>
                    <Text style={[styles.stepTitle, isDone && styles.stepTitleDone]}>
                      {st.title}
                    </Text>
                  </View>

                  <Text style={styles.stepDesc}>{st.desc}</Text>

                  <View style={styles.expectedBox}>
                    <Ionicons name="checkmark-done" size={14} color="#059669" />
                    <Text style={styles.expectedText}>
                      <Text style={{ fontWeight: '700' }}>Expected Standard: </Text>
                      {st.expected}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.doneBtnText}>
                {checkedSteps.length === currentDiag.steps.length
                  ? '✅ Diagnostic Passed & Confirmed'
                  : 'Close Assistant'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modal: {
    width: '100%',
    height: '86%',
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
    marginBottom: 14,
  },
  catTabs: {
    gap: 8,
    paddingBottom: 4,
  },
  catTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  catTabActive: {
    backgroundColor: '#34D399',
  },
  catTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  catTabTextActive: {
    color: '#0D3325',
    fontWeight: '800',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0D3325',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepCardDone: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  stepIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconDone: {
    backgroundColor: '#DCFCE7',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  stepTitleDone: {
    color: '#15803D',
  },
  stepDesc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 10,
  },
  expectedBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  expectedText: {
    fontSize: 11.5,
    color: '#334155',
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  doneBtn: {
    backgroundColor: '#0D3325',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
