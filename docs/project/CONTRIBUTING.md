# Contributing to Urban Helpers

Thank you for your interest in contributing to Urban Helpers! This document provides guidelines and instructions for contributing to the project.

---

## 🎯 Development Philosophy

- **Type Safety:** All code must pass TypeScript strict mode
- **Quality First:** Code quality > speed
- **User Focused:** Every change should improve user experience
- **Mobile First:** Design and build for mobile constraints
- **Performance:** Animations must run at 60fps, load times <2s

---

## 🚀 Getting Started

### 1. Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/designingoff-pixel/UrbanHelpersApp.git
cd UrbanHelperApp/UrbanHelperApp/UrbanHelpersApp

# Install dependencies
npm install --legacy-peer-deps

# Verify setup
npm run typecheck
```

### 2. Start Development Server

```bash
# Start Expo dev server
npm start

# Then press:
# 'a' for Android
# 'i' for iOS
# 'w' for web (if available)
```

### 3. Create Feature Branch

```bash
# Create branch from main
git checkout -b feature/your-feature-name

# Example:
git checkout -b feature/add-payment-integration
```

---

## 📋 Code Standards

### TypeScript Rules
- ✅ **Strict mode enabled** — No `any` types
- ✅ **Explicit return types** — All functions must have return type
- ✅ **No unused variables** — Clean up before committing
- ✅ **Proper error handling** — Try-catch or error boundaries

```typescript
// ✅ Good
function getUserData(id: string): Promise<User> {
  return fetchUser(id).catch((error) => {
    console.error('Failed to fetch user:', error);
    throw new Error('User not found');
  });
}

// ❌ Bad
function getUserData(id: any) {
  return fetchUser(id);
}
```

### Component Naming
- **Screens:** `PascalCase` + `Screen` suffix
  - `HomeDashboardScreen.tsx`
  - `ServiceDetailScreen.tsx`
- **Components:** `PascalCase`
  - `Button.tsx`, `Card.tsx`, `TopAppBar.tsx`
- **Utilities:** `camelCase`
  - `formatDate.ts`, `calculateTotal.ts`
- **Hooks:** `camelCase` + `use` prefix
  - `useNavigation.ts`, `useTheme.ts`

### File Organization

```
src/screens/
├── services/
│   ├── ServicesDashboardScreen.tsx
│   ├── ServiceDetailScreen.tsx
│   └── servicesData.ts (constants, mock data)
├── health/
│   ├── HealthDashboardScreen.tsx
│   └── ...
```

### Component Structure

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Type definitions
type Props = NativeStackScreenProps<RootStackParamList, 'ScreenName'>;

interface LocalState {
  isLoading: boolean;
}

// Component
export const MyScreen: React.FC<Props> = ({ route, navigation }) => {
  const [state, setState] = React.useState<LocalState>({
    isLoading: false,
  });

  React.useEffect(() => {
    // Setup effect
  }, []);

  return (
    <View style={styles.container}>
      <Text>Content here</Text>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

---

## 🎨 Design System

### Use Existing Components
- ✅ `<ScreenContainer>` — Safe area wrapper
- ✅ `<Button>` — Primary/secondary buttons
- ✅ `<Card>` — Surface component
- ✅ `<TopAppBar>` — Header bar
- ✅ `<BottomNavBar>` — Navigation

**Don't reinvent the wheel.** Check `src/components/` before creating new components.

### Colors
Always use theme colors from `src/theme/colors.ts`:

```typescript
import { colors } from '@/theme/colors';

<View style={{ backgroundColor: colors.primary }}>
  {/* Content */}
</View>
```

### Spacing
Use `16px` base padding and `8px` gaps:

```typescript
import { spacing } from '@/theme/spacing';

<View style={{ padding: spacing.base, gap: spacing.xs }}>
  {/* Content */}
</View>
```

---

## 🧪 Testing

### Before Submitting PR

1. **Type check:** `npm run typecheck`
2. **Manual test on device:** Install APK and test feature
3. **Test edge cases:** Empty states, errors, slow networks
4. **Check animations:** Smooth 60fps on low-end devices

### Testing Checklist

- [ ] Feature works on Android 10+
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] No memory leaks
- [ ] Animations smooth (60fps)
- [ ] Tested with real data (not mocks)

---

## 📝 Commit Messages

Use conventional commit format:

```
type(scope): subject

body (optional)

footer (optional)
```

### Types
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `style` — Formatting (no logic change)
- `refactor` — Code refactoring
- `perf` — Performance improvement
- `test` — Adding tests
- `chore` — Maintenance

### Examples

```bash
# Good
git commit -m "feat(services): add RO service category with 7 sub-services"
git commit -m "fix(health): scroll-safe tap on dashboard cards"
git commit -m "docs: add deployment guide for Play Store"
git commit -m "perf: optimize image loading in service carousel"

# Bad
git commit -m "update files"
git commit -m "fixed stuff"
git commit -m "WIP: trying new feature"
```

---

## 🔄 Pull Request Process

### 1. Before Creating PR

- [ ] Branch updated with latest `main`
- [ ] All changes tested locally
- [ ] No TypeScript errors
- [ ] Commit messages follow convention

```bash
git fetch origin
git rebase origin/main
npm run typecheck
```

### 2. Create Pull Request

**Title Format:**
```
[Type] Brief description (50 chars max)
```

Examples:
- `[feat] Add RO service category`
- `[fix] Fix scroll-tap bug on health dashboard`
- `[docs] Add deployment guide`

**Description Template:**
```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Documentation update

## How to Test
1. Step to test the feature
2. Expected result
3. Actual result (should match expected)

## Screenshots/Videos
If UI changes, add screenshots.

## Checklist
- [ ] TypeScript: No errors
- [ ] Tested on device
- [ ] Code reviewed by me
- [ ] Documentation updated
```

### 3. Code Review

- Address all review comments
- Push additional commits for fixes
- Don't force-push after review (keep history)

### 4. Merge

Once approved:
- Squash merge to `main`
- Delete feature branch
- Confirm GitHub Actions passes

---

## 🐛 Bug Reports

### How to Report

1. **Check existing issues** — Don't duplicate
2. **Create new issue** with `[BUG]` prefix
3. **Include:**
   - Device model and Android version
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots/videos

### Bug Template

```markdown
## Device Info
- Device: Samsung Galaxy A12
- Android: 11
- App Version: 1.0.0

## Steps to Reproduce
1. Open app
2. Navigate to Services
3. Tap on RO Service
4. ...

## Expected Behavior
Services list should display

## Actual Behavior
App crashes with error

## Error Log
[Paste error log here]

## Screenshots
[Attach screenshot]
```

---

## 💡 Feature Requests

### How to Request

1. **Check discussions** — Don't duplicate
2. **Create discussion** with `[FEATURE]` prefix
3. **Include:**
   - Use case (why is this needed?)
   - Expected behavior
   - Proposed solution (optional)
   - Any design mockups (optional)

### Feature Template

```markdown
## Feature Request
Brief description of the feature.

## Use Case
Why is this feature needed? Who would use it?

## Proposed Solution
How should this work?

## Alternative Solutions
Other approaches considered.

## Additional Context
Any other relevant information.
```

---

## 📚 Architecture Guidelines

### Adding New Screens

1. **Create file:** `src/screens/module/NewScreen.tsx`
2. **Add route:** Update `src/navigation/types.ts`
3. **Add navigation:** Update `RootNavigator.tsx`
4. **Use shared components:** `ScreenContainer`, `Button`, etc.
5. **Style with theme:** Colors, spacing, typography from theme

### Adding New Service Category

1. **Update `servicesData.ts`:** Add 10 services data
2. **Create category screen:** `Service[Category]Screen.tsx`
3. **Wire navigation:** Add route and handle navigation
4. **Add icon:** Use Ionicons
5. **Test booking flow:** Full end-to-end

### Adding Animations

- Use `Reanimated v3` (not Animated API)
- Target 60fps performance
- Test on low-end devices (Snapdragon 665+)
- Use `withSpring` for natural feel
- Keep animations <300ms

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

const handlePress = () => {
  scale.value = withSpring(1.05, { damping: 5 });
};
```

---

## 🚀 Performance Tips

### Image Optimization
- Compress images to <100KB
- Use `JPEG` for photos, `PNG` for graphics
- Use React Native `Image` with explicit dimensions

### Bundle Size
- Use code splitting for large features
- Lazy load screens if possible
- Remove unused dependencies
- Check bundle with `npx webpack-bundle-analyzer`

### Animation Performance
- Use `useAnimatedStyle` + `useSharedValue`
- Avoid `setNativeDriver: false`
- Test on 2GB RAM device minimum
- Profile with React Native Debugger

### List Performance
- Use `FlatList` with `maxToRenderPerBatch={10}`
- Implement `getItemLayout` for random access
- Memoize list items with `React.memo`

---

## 📖 Documentation

### Update Docs When:
- Adding new screens
- Changing navigation structure
- Adding new features
- Fixing bugs with workarounds

### Documentation Checklist
- [ ] README.md updated
- [ ] Inline code comments added
- [ ] Type definitions documented
- [ ] Complex logic explained

---

## 🎓 Learning Resources

- **React Native:** [Official Docs](https://reactnative.dev/)
- **Expo:** [Expo Docs](https://docs.expo.dev/)
- **React Navigation:** [Navigation Docs](https://reactnavigation.org/)
- **Reanimated:** [Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
- **TypeScript:** [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🤝 Code of Conduct

- Be respectful and inclusive
- Give constructive feedback
- Help others learn
- Report issues privately if security-related
- No harassment or discrimination

---

## ❓ Questions?

- Check existing discussions on GitHub
- Create new discussion for questions
- Tag maintainers if urgent

---

## 🙏 Thank You

Thank you for contributing to Urban Helpers! Your work helps make the app better for users. 💚

**Happy coding!**
