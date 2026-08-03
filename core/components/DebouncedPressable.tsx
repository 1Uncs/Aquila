import { useRef, useCallback } from 'react';
import { Pressable, PressableProps } from 'react-native';

const DEBOUNCE_MS = 300;

type DebouncedPressableProps = {
  onPress: () => void;
  debounceMs?: number;
  disabled?: boolean;
  style?: PressableProps['style'];
  testID?: string;
  children: React.ReactNode;
} & Omit<PressableProps, 'onPress' | 'style' | 'children'>;

export function DebouncedPressable({
  onPress,
  debounceMs = DEBOUNCE_MS,
  disabled = false,
  style,
  testID,
  children,
  ...rest
}: DebouncedPressableProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressedRef = useRef(false);

  const handlePress = useCallback(() => {
    if (disabled || pressedRef.current) return;
    pressedRef.current = true;
    onPress();
    timerRef.current = setTimeout(() => {
      pressedRef.current = false;
      timerRef.current = null;
    }, debounceMs);
  }, [onPress, debounceMs, disabled]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={style}
      testID={testID}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
